import { createIdentityTokenTtl, ONE_HOUR_IDENTITY_TOKEN_TTL } from '@/application/identity/identity-token.ports';
import { uuidIdentityTokenGenerator } from '@/infrastructure/identity/uuid-identity-token-generator';
import { v4 as createUuid } from 'uuid';

jest.mock('uuid');

describe('UUID identity token generator', () => {
    it('creates a token with the typed one-hour identity TTL', () => {
        (createUuid as jest.Mock).mockReturnValue('token-1');
        const now = new Date('2026-01-01T00:00:00.000Z');

        expect(uuidIdentityTokenGenerator.generate(ONE_HOUR_IDENTITY_TOKEN_TTL, now)).toEqual({
            token: 'token-1',
            expires: new Date('2026-01-01T01:00:00.000Z'),
        });
    });

    it('rejects an invalid TTL before it reaches the generator', () => {
        expect(() => createIdentityTokenTtl(0)).toThrow('TTL');
    });
});
