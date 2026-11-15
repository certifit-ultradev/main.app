import { NextRequest } from 'next/server';
import { quoteCoursePaymentTransaction } from '@/services/payments';
import { POST } from '@/src/app/api/payment/transactions/quote/route';
import { CourseAlreadyPurchasedError } from '@/exceptions/course-already-purchased';
import { CourseInvalidStateError } from '@/exceptions/course-invalid-state';

jest.mock('@/services/payments', () => ({ quoteCoursePaymentTransaction: jest.fn() }));
jest.mock('@/shared/observability/safe-logger', () => ({ safeLogger: { error: jest.fn() } }));

const request = (body: string) => new NextRequest('http://localhost/api/payment/transactions/quote', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
});

describe('POST /api/payment/transactions/quote', () => {
    beforeEach(() => jest.clearAllMocks());

    it('validates the canonical course identifier before invoking the service', async () => {
        const response = await POST(request(JSON.stringify({ canonicalId: '' })));
        expect(response.status).toBe(422);
        await expect(response.json()).resolves.toMatchObject({ error: { code: 'VALIDATION' } });
        expect(quoteCoursePaymentTransaction).not.toHaveBeenCalled();
    });

    it('passes the closed quote command to the service', async () => {
        const quote = {
            purchaseId: 1, currency: 'COP', amountInCents: 10000, reference: 'ref', publicKey: 'pub',
            signature: { integrity: 'hash' }, redirectUrl: 'https://example.com/review', expirationTime: 1,
        };
        (quoteCoursePaymentTransaction as jest.Mock).mockResolvedValue({ ...quote, providerSecret: 'hidden' });
        const response = await POST(request(JSON.stringify({ canonicalId: 'course-1' })));

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ data: quote });
        expect(quoteCoursePaymentTransaction).toHaveBeenCalledWith({ canonicalId: 'course-1' });
    });

    it('returns 400 for malformed JSON', async () => {
        const response = await POST(request('{'));
        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toMatchObject({ error: { code: 'BAD_REQUEST' } });
    });

    it.each([
        [new CourseAlreadyPurchasedError('private id'), 409, 'CONFLICT'],
        [new CourseInvalidStateError('private state'), 409, 'CONFLICT'],
        [new Error('private provider response'), 500, 'UNEXPECTED'],
    ])('maps quote errors without leaking internal data %#', async (error, status, code) => {
        (quoteCoursePaymentTransaction as jest.Mock).mockRejectedValue(error);
        const response = await POST(request(JSON.stringify({ canonicalId: 'course-1' })));
        expect(response.status).toBe(status);
        const body = await response.json();
        expect(body).toMatchObject({ error: { code } });
        expect(JSON.stringify(body)).not.toContain('private');
        expect(body).not.toHaveProperty('data');
    });
});
