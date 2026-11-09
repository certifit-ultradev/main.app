/**
 * Cryptographic password transformation required by identity use cases.
 * Persistence adapters receive only the resulting hash.
 */
export interface PasswordHasher {
    hash(plainPassword: string): Promise<string>;
}
