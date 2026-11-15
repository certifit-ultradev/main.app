import { DIAL_CODES, isValidCombinedPhoneNumber, splitPhoneNumber } from '@/shared/phone-number';

describe('phone number with a separate calling code', () => {
    it('recognizes one-digit and three-digit calling codes in stored values', () => {
        expect(splitPhoneNumber('14155552671')).toEqual({ dialCode: '1', nationalNumber: '4155552671' });
        expect(splitPhoneNumber('355672123456')).toEqual({ dialCode: '355', nationalNumber: '672123456' });
        expect(splitPhoneNumber('573001234567')).toEqual({ dialCode: '57', nationalNumber: '3001234567' });
    });

    it('exposes only country calling codes and validates the combined digits', () => {
        expect(DIAL_CODES).toContain('1');
        expect(DIAL_CODES).toContain('355');
        expect(DIAL_CODES).not.toContain('1242');
        expect(isValidCombinedPhoneNumber('14155552671')).toBe(true);
        expect(isValidCombinedPhoneNumber('355672123456')).toBe(true);
        expect(isValidCombinedPhoneNumber('573001234567')).toBe(true);
        expect(isValidCombinedPhoneNumber('+57 3001234567')).toBe(false);
        expect(isValidCombinedPhoneNumber('9999999999')).toBe(false);
    });
});
