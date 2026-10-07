import { getPaymentReviewUrl } from '@/infrastructure/payments/payment-redirect-url';
import { getPublicAppUrl } from '@/config/env';

jest.mock('@/config/env', () => ({ getPublicAppUrl: jest.fn() }));

describe('payment redirect URL', () => {
    it('builds the payment review location from public app configuration', () => {
        (getPublicAppUrl as jest.Mock).mockReturnValue('https://example.com');
        expect(getPaymentReviewUrl()).toBe('https://example.com/payment-review');
    });

    it('propagates missing public configuration', () => {
        (getPublicAppUrl as jest.Mock).mockImplementation(() => { throw new Error('Missing URL'); });
        expect(getPaymentReviewUrl).toThrow('Missing URL');
    });
});
