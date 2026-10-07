import { sha256 } from '@/shared/crypto/sha256';

/**
 * Wompi's checkout integrity protocol. The SHA-256 primitive stays in
 * `shared/crypto`; this module owns the provider-specific concatenation.
 */
export const createWompiCheckoutIntegrity = async (
    reference: string,
    amountInCents: number,
    integrityKey: string,
): Promise<string> => sha256(`${reference}${amountInCents}COP${integrityKey}`);
