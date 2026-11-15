import { auth } from '@/auth';
import { EmailUnverifiedError, InsufficientRoleError } from '@/exceptions/actor-access-errors';
import { UserNotLoggedError } from '@/exceptions/user-not-logged';
import { getAuthenticatedActor, withAdminAuthenticatedActor } from '@/infrastructure/auth/authenticated-actor';

jest.mock('@/auth', () => ({ auth: jest.fn() }));

const verifiedAt = new Date('2026-01-01T00:00:00.000Z');
const sessionFor = (user: { id: string; emailVerified: Date | null; isAdmin: boolean }) => ({
    user: { ...user, email: 'private@example.com' },
});

describe('HTTP authenticated actor', () => {
    beforeEach(() => jest.clearAllMocks());

    it('uses one session lookup and rejects an absent session as unauthenticated', async () => {
        (auth as jest.Mock).mockResolvedValue(null);

        await expect(getAuthenticatedActor({ requireAdmin: true })).rejects.toBeInstanceOf(UserNotLoggedError);
        expect(auth).toHaveBeenCalledTimes(1);
    });

    it('distinguishes an unverified actor from an absent session', async () => {
        (auth as jest.Mock).mockResolvedValue(sessionFor({ id: 'admin', emailVerified: null, isAdmin: true }));

        await expect(getAuthenticatedActor({ requireAdmin: true })).rejects.toBeInstanceOf(EmailUnverifiedError);
        expect(auth).toHaveBeenCalledTimes(1);
    });

    it('distinguishes an insufficient role from an absent session', async () => {
        (auth as jest.Mock).mockResolvedValue(sessionFor({ id: 'student', emailVerified: verifiedAt, isAdmin: false }));

        await expect(getAuthenticatedActor({ requireAdmin: true })).rejects.toBeInstanceOf(InsufficientRoleError);
        expect(auth).toHaveBeenCalledTimes(1);
    });

    it('passes the authenticated actor to an admin operation without reloading the session', async () => {
        (auth as jest.Mock).mockResolvedValue(sessionFor({ id: 'admin', emailVerified: verifiedAt, isAdmin: true }));
        const operation = jest.fn(async (actor: { id: string }, value: number) => `${actor.id}:${value}`);

        await expect(withAdminAuthenticatedActor(operation)(3)).resolves.toBe('admin:3');
        expect(operation).toHaveBeenCalledTimes(1);
        expect(auth).toHaveBeenCalledTimes(1);
    });

    it('retains the explicit Blob exception for an unverified admin', async () => {
        (auth as jest.Mock).mockResolvedValue(sessionFor({ id: 'admin', emailVerified: null, isAdmin: true }));

        await expect(getAuthenticatedActor({ requireAdmin: true, requireEmailVerified: false }))
            .resolves.toMatchObject({ id: 'admin', emailVerified: null });
        expect(auth).toHaveBeenCalledTimes(1);
    });
});
