import { resetEnvCache } from '@/config/env';
import type { TransactionWompiResponse } from '@/infrastructure/payments/wompi.types';
import { getTransaction } from '@/repository/wompi-api';

global.fetch = jest.fn();

const responseFor = (overrides: Partial<TransactionWompiResponse['data']> = {}): TransactionWompiResponse => ({
    data: {
        id: 'trx-123',
        created_at: new Date('2025-01-15T00:00:00.000Z'),
        amount_in_cents: 10000000,
        status: 'APPROVED',
        reference: 'ref-xyz',
        customer_email: 'customer@test.com',
        currency: 'COP',
        payment_method_type: 'NEQUI',
        payment_method: { phone_number: '+573001234567' },
        redirect_url: 'https://example.com/success',
        payment_link_id: 'link-123',
        ...overrides,
    },
});

const mockResponse = (payload: unknown): void => {
    (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(payload),
    });
};

describe('Wompi API repository', () => {
    const originalEnv = process.env;
    const testEnv = {
        WOMPI_PUB_KEY: 'test-public-key',
        WOMPI_SIG_DATA: 'test-signature-key',
        DATABASE_URL: 'postgresql://user:password@localhost:5432/test',
        AUTH_SECRET: 'test-auth-secret',
        FROM_EMAIL: 'noreply@example.com',
        MAILERSEND_SMTP_USER: 'test-smtp-user',
        MAILERSEND_SMTP_PASSWORD: 'test-smtp-password',
    };

    beforeEach(() => {
        process.env = { ...originalEnv, ...testEnv, APP_ENV: 'DEV' };
        resetEnvCache();
        jest.clearAllMocks();
    });

    afterEach(() => {
        process.env = originalEnv;
        resetEnvCache();
    });

    it('returns only the five fields needed by payment registration', async () => {
        mockResponse(responseFor());

        await expect(getTransaction('trx-123')).resolves.toEqual({
            id: 'trx-123',
            reference: 'ref-xyz',
            status: 'APPROVED',
            paymentMethodType: 'NEQUI',
            createdAt: new Date('2025-01-15T00:00:00.000Z'),
        });
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/transactions/trx-123'),
            { method: 'GET', headers: { 'Content-Type': 'application/json' } },
        );
    });

    it('normalizes the ISO date in a JSON response', async () => {
        mockResponse({ data: { ...responseFor().data, created_at: '2025-03-20T10:11:12.000Z' } });

        const transaction = await getTransaction('trx-iso');
        expect(transaction.createdAt).toEqual(new Date('2025-03-20T10:11:12.000Z'));
    });

    it('does not expose extra Wompi fields or customer information', async () => {
        mockResponse({ ...responseFor(), secret: 'private', data: { ...responseFor().data, secret: 'private' } });

        const transaction = await getTransaction('trx-123');
        expect(Object.keys(transaction).sort()).toEqual(['createdAt', 'id', 'paymentMethodType', 'reference', 'status']);
        expect(JSON.stringify(transaction)).not.toContain('customer@test.com');
        expect(JSON.stringify(transaction)).not.toContain('private');
    });

    it.each(['DEV', undefined])('uses sandbox when APP_ENV is %s', async (appEnv) => {
        if (appEnv === undefined) delete process.env.APP_ENV;
        else process.env.APP_ENV = appEnv;
        resetEnvCache();
        mockResponse(responseFor());

        await getTransaction('trx-sandbox');
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('sandbox.wompi.co'), expect.any(Object));
    });

    it('uses production when APP_ENV is PROD', async () => {
        process.env.APP_ENV = 'PROD';
        resetEnvCache();
        mockResponse(responseFor());

        await getTransaction('trx-production');
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('production.wompi.co'), expect.any(Object));
    });

    it.each([400, 401, 403, 404, 500, 503])('classifies upstream HTTP status %i without leaking details', async (status) => {
        (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status });

        await expect(getTransaction('trx-error')).rejects.toMatchObject({
            name: 'PaymentProviderError',
            kind: status === 404 ? 'transaction_not_found' : 'upstream_error',
        });
    });

    it.each([
        { data: { id: 'trx-invalid', created_at: 'not-a-date' } },
        { data: { ...responseFor().data, reference: '' } },
        { data: { ...responseFor().data, payment_method: null } },
        { data: { ...responseFor().data, created_at: '2025-13-99T00:00:00.000Z' } },
        { data: { ...responseFor().data, status: 'UNKNOWN' } },
        null,
    ])('rejects malformed provider payloads', async (payload) => {
        mockResponse(payload);

        await expect(getTransaction('trx-invalid')).rejects.toMatchObject({
            name: 'PaymentProviderError', kind: 'invalid_response',
        });
    });

    it('classifies invalid JSON as a provider response failure', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true, status: 200, json: jest.fn().mockRejectedValue(new SyntaxError('private payload')),
        });
        await expect(getTransaction('trx-json')).rejects.toMatchObject({
            name: 'PaymentProviderError', kind: 'invalid_response',
        });
    });

    it('classifies network errors without exposing transport details', async () => {
        (global.fetch as jest.Mock).mockRejectedValue(new Error('private gateway host'));

        await expect(getTransaction('trx-network')).rejects.toMatchObject({
            name: 'PaymentProviderError', kind: 'unavailable',
        });
    });

    it.each(['APPROVED', 'DECLINED', 'PENDING', 'ERROR', 'VOIDED'] as const)(
        'projects supported provider status %s', async (status) => {
            mockResponse(responseFor({ status }));

            await expect(getTransaction('trx-status')).resolves.toMatchObject({ status });
        },
    );

    it.each(['trx-1', 'trx-abc-xyz', 'transaction-12345'])('queries transaction id %s', async (id) => {
        mockResponse(responseFor({ id }));

        await expect(getTransaction(id)).resolves.toMatchObject({ id });
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining(`/transactions/${id}`), expect.any(Object));
    });
});
