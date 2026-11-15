import { COUNTRY_CALLING_CODES } from './country-calling-codes';

// Four-digit entries in the source are North American area codes. Their
// country calling code is +1, already present in this list.
export const DIAL_CODES = [...new Set(COUNTRY_CALLING_CODES.map(([, code]) => code).filter((code) => code.length <= 3))]
    .sort((a, b) => Number(a) - Number(b));

const DIAL_CODE_SET = new Set<string>(DIAL_CODES);
const SORTED_CODES = [...DIAL_CODES].sort((a, b) => b.length - a.length);
export const DEFAULT_DIAL_CODE = '57';

export function splitPhoneNumber(value: string | null | undefined): { dialCode: string; nationalNumber: string } {
    const digits = value ?? '';
    if (!digits) return { dialCode: DEFAULT_DIAL_CODE, nationalNumber: '' };
    const dialCode = SORTED_CODES.find((code) => digits.startsWith(code));
    return dialCode
        ? { dialCode, nationalNumber: digits.slice(dialCode.length) }
        : { dialCode: DEFAULT_DIAL_CODE, nationalNumber: digits };
}

export function isValidCombinedPhoneNumber(value: string): boolean {
    if (!/^\d{7,15}$/.test(value)) return false;
    const { dialCode, nationalNumber } = splitPhoneNumber(value);
    return DIAL_CODE_SET.has(dialCode) && nationalNumber.length >= 4
        && value === `${dialCode}${nationalNumber}`;
}
