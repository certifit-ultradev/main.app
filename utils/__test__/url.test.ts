import { getPaymentReviewUrl } from '../url';

describe('utils/url', () => {
    describe('getPaymentReviewUrl', () => {
        const originalEnv = process.env;

        beforeEach(() => {
            jest.resetModules();
            process.env = { ...originalEnv };
        });

        afterEach(() => {
            process.env = originalEnv;
        });

        it('should return payment review URL with domain from env', () => {
            process.env.NEXT_PUBLIC_DOMAIN = 'https://example.com';
            
            const result = getPaymentReviewUrl();
            
            expect(result).toBe('https://example.com/payment-review');
        });

        it('should handle domain without trailing slash', () => {
            process.env.NEXT_PUBLIC_DOMAIN = 'https://myapp.com';
            
            const result = getPaymentReviewUrl();
            
            expect(result).toBe('https://myapp.com/payment-review');
        });

        it('should handle localhost domain', () => {
            process.env.NEXT_PUBLIC_DOMAIN = 'http://localhost:3000';
            
            const result = getPaymentReviewUrl();
            
            expect(result).toBe('http://localhost:3000/payment-review');
        });

        it('should handle undefined domain', () => {
            delete process.env.NEXT_PUBLIC_DOMAIN;
            
            const result = getPaymentReviewUrl();
            
            expect(result).toBe('undefined/payment-review');
        });

        it('should handle empty domain', () => {
            process.env.NEXT_PUBLIC_DOMAIN = '';
            
            const result = getPaymentReviewUrl();
            
            expect(result).toBe('/payment-review');
        });
    });
});
