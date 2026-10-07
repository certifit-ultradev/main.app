import { v4 as createUuid } from 'uuid';
import type { GeneratedIdentityToken, IdentityTokenGenerator, IdentityTokenTtl } from '@/application/identity/identity-token.ports';

export const uuidIdentityTokenGenerator: IdentityTokenGenerator = {
    generate(ttl: IdentityTokenTtl, now: Date = new Date()): GeneratedIdentityToken {
        return {
            token: createUuid(),
            expires: new Date(now.getTime() + ttl),
        };
    },
};
