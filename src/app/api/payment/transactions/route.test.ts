import { NextRequest } from 'next/server';
import { UserNotLoggedError } from '@/exceptions/user-not-logged';
import { NotFoundError } from '@/exceptions/not-found';
import { TransactionError } from '@/exceptions/transaction-error';
import { PaymentProviderError } from '@/exceptions/payment-provider-error';
import { createCoursePaymentTransaction } from '@/services/payments';
import { POST } from '@/src/app/api/payment/transactions/route';

jest.mock('@/services/payments', () => ({ createCoursePaymentTransaction: jest.fn() }));
jest.mock('@/shared/observability/safe-logger', () => ({ safeLogger: { error: jest.fn() } }));

const request = (body: string) => new NextRequest('http://localhost/api/payment/transactions', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
});

describe('POST /api/payment/transactions', () => {
    beforeEach(() => jest.clearAllMocks());

    it.each([
        { purchaseId: '1', transactionId: 'trx-1' },
        { purchaseId: 1, id: 'legacy-id' },
        { purchaseId: 0, transactionId: 'trx-1' },
    ])('rejects invalid transaction input %#', async (body) => {
        const response = await POST(request(JSON.stringify(body)));
        expect(response.status).toBe(422);
        await expect(response.json()).resolves.toEqual({ error: { code: 'VALIDATION', message: 'Datos inválidos.' } });
        expect(createCoursePaymentTransaction).not.toHaveBeenCalled();
    });

    it('returns 400 for malformed JSON before invoking the service', async () => {
        const response = await POST(request('{'));
        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toMatchObject({ error: { code: 'BAD_REQUEST' } });
        expect(createCoursePaymentTransaction).not.toHaveBeenCalled();
    });

    it('maps an unauthenticated actor to 401', async () => {
        (createCoursePaymentTransaction as jest.Mock).mockRejectedValue(
            new UserNotLoggedError('El usuario debe iniciar sesión'),
        );

        const response = await POST(request(JSON.stringify({ purchaseId: 7, transactionId: 'trx-1' })));
        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toMatchObject({ error: { code: 'UNAUTHENTICATED' } });
    });

    it.each([
        [new NotFoundError('private transaction id'), 404, 'NOT_FOUND'],
        [new PaymentProviderError('transaction_not_found'), 404, 'NOT_FOUND'],
        [new TransactionError('private transaction cause'), 409, 'CONFLICT'],
        [new PaymentProviderError('invalid_response'), 502, 'BAD_GATEWAY'],
        [new PaymentProviderError('upstream_error'), 502, 'BAD_GATEWAY'],
        [new PaymentProviderError('unavailable'), 503, 'SERVICE_UNAVAILABLE'],
        [new Error('private provider token'), 500, 'UNEXPECTED'],
    ])('maps a failed registration to a public error %#', async (error, status, code) => {
        (createCoursePaymentTransaction as jest.Mock).mockRejectedValue(error);
        const response = await POST(request(JSON.stringify({ purchaseId: 7, transactionId: 'trx-1' })));
        expect(response.status).toBe(status);
        const body = await response.json();
        expect(body).toMatchObject({ error: { code } });
        expect(JSON.stringify(body)).not.toContain('private');
        expect(body).not.toHaveProperty('data');
    });

    it('passes purchaseId and transactionId without aliases or casts', async () => {
        (createCoursePaymentTransaction as jest.Mock).mockResolvedValue({ success: true, message: 'Pago registrado correctamente.', providerSecret: 'hidden' });
        const response = await POST(request(JSON.stringify({ purchaseId: 7, transactionId: 'trx-1' })));

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ data: { message: 'Pago registrado correctamente.' } });
        expect(createCoursePaymentTransaction).toHaveBeenCalledWith({ purchaseId: 7, transactionId: 'trx-1' });
    });
});
