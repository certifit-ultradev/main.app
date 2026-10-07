import { toVerifiedDate } from '@/auth.config';

describe('auth session date normalization', () => {
    it('accepts valid Date and serialized JWT dates', () => {
        const date = new Date('2025-01-01T00:00:00.000Z');
        expect(toVerifiedDate(date)).toBe(date);
        expect(toVerifiedDate('2025-01-01T00:00:00.000Z')).toEqual(date);
    });

    it('keeps absent and invalid verification values unverified', () => {
        expect(toVerifiedDate(null)).toBeNull();
        expect(toVerifiedDate('invalid')).toBeNull();
        expect(toVerifiedDate({ verified: true })).toBeNull();
    });
});
