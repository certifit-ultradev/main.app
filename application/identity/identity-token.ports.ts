export type IdentityTokenTtl = number & { readonly __identityTokenTtl: unique symbol };

export type GeneratedIdentityToken = {
    token: string;
    expires: Date;
};

export interface IdentityTokenGenerator {
    generate(ttl: IdentityTokenTtl, now?: Date): GeneratedIdentityToken;
}

export function createIdentityTokenTtl(milliseconds: number): IdentityTokenTtl {
    if (!Number.isSafeInteger(milliseconds) || milliseconds <= 0) {
        throw new Error('El TTL del token de identidad debe ser un entero positivo.');
    }
    return milliseconds as IdentityTokenTtl;
}

export const ONE_HOUR_IDENTITY_TOKEN_TTL = createIdentityTokenTtl(60 * 60 * 1000);
