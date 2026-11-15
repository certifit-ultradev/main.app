import {
    PaymentQuoteRequestSchema, PaymentQuoteResponseSchema, PaymentStatusSchema,
    PaymentTransactionRequestSchema, PaymentTransactionResponseSchema,
} from '@/interfaces/http/payments/payment.contract';
import { apiSuccessSchema } from '@/interfaces/http/api-response.schema';

describe('payment HTTP contracts', () => {
    it('accepts the exact quote and transaction payloads', () => {
        expect(PaymentQuoteRequestSchema.parse({ canonicalId: 'course-1' })).toEqual({ canonicalId: 'course-1' });
        expect(PaymentTransactionRequestSchema.parse({ purchaseId: 1, transactionId: 'trx-1' })).toEqual({ purchaseId: 1, transactionId: 'trx-1' });
    });

    it('rejects aliases, string IDs and unknown payment statuses', () => {
        expect(() => PaymentTransactionRequestSchema.parse({ purchaseId: '1', id: 'trx-1' })).toThrow();
        expect(() => PaymentStatusSchema.parse('UNKNOWN')).toThrow();
    });

    it('accepts only the closed quote and registration response envelopes', () => {
        const quote = {
            purchaseId: 1, currency: 'COP', amountInCents: 10000, reference: 'ref', publicKey: 'pub',
            signature: { integrity: 'hash' }, redirectUrl: 'https://example.com/review', expirationTime: 1,
        };
        expect(apiSuccessSchema(PaymentQuoteResponseSchema).safeParse({ data: quote }).success).toBe(true);
        expect(apiSuccessSchema(PaymentQuoteResponseSchema).safeParse({ data: quote, error: { code: 'CONFLICT', message: 'x' } }).success).toBe(false);
        expect(apiSuccessSchema(PaymentQuoteResponseSchema).safeParse({ data: { ...quote, success: true } }).success).toBe(false);
        expect(apiSuccessSchema(PaymentTransactionResponseSchema).safeParse({ data: { message: 'Pago registrado.' } }).success).toBe(true);
        expect(apiSuccessSchema(PaymentTransactionResponseSchema).safeParse({ data: { message: 'Pago registrado.', success: true } }).success).toBe(false);
    });
});
