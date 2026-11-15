import { auth } from '@/auth';
import {
    isActionFailure,
    requireAdminActionContext,
    requireAuthenticatedActionContext,
    requireVerifiedUserActionContext,
} from '@/interfaces/actions/action-context';

jest.mock('@/auth', () => ({ auth: jest.fn() }));

describe('requireAdminActionContext', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns a typed, immutable actor after one session lookup', async () => {
        (auth as jest.Mock).mockResolvedValue({ user: { id: 'admin', email: 'a@example.com', isAdmin: true, emailVerified: new Date() } });
        const result = await requireAdminActionContext();
        expect(isActionFailure(result)).toBe(false);
        expect(auth).toHaveBeenCalledTimes(1);
        if (!isActionFailure(result)) {
            expect(result.actor).toEqual(expect.objectContaining({ userId: 'admin', role: 'ADMIN' }));
            expect(Object.isFrozen(result)).toBe(true);
            expect(Object.isFrozen(result.actor)).toBe(true);
        }
    });

    it('distinguishes missing authentication', async () => {
        (auth as jest.Mock).mockResolvedValue(null);
        const result = await requireAdminActionContext();
        expect(isActionFailure(result) && result.error.code).toBe('UNAUTHENTICATED');
    });

    it('hides session provider failures behind UNEXPECTED', async () => {
        (auth as jest.Mock).mockRejectedValue(new Error('private provider detail'));
        const result = await requireAuthenticatedActionContext();
        expect(isActionFailure(result) && result.error).toEqual({
            code: 'UNEXPECTED', message: 'No fue posible validar la sesión.',
        });
        expect(auth).toHaveBeenCalledTimes(1);
    });

    it('distinguishes a non-admin actor', async () => {
        (auth as jest.Mock).mockResolvedValue({ user: { id: 'student', isAdmin: false, emailVerified: new Date() } });
        const result = await requireAdminActionContext();
        expect(isActionFailure(result) && result.error.code).toBe('FORBIDDEN');
    });

    it('prioritizes forbidden role over email verification for non-admin actors', async () => {
        (auth as jest.Mock).mockResolvedValue({ user: { id: 'student', isAdmin: false, emailVerified: null } });
        const result = await requireAdminActionContext();
        expect(isActionFailure(result) && result.error.code).toBe('FORBIDDEN');
        expect(auth).toHaveBeenCalledTimes(1);
    });

    it('distinguishes an unverified administrator', async () => {
        (auth as jest.Mock).mockResolvedValue({ user: { id: 'admin', isAdmin: true, emailVerified: null } });
        const result = await requireAdminActionContext();
        expect(isActionFailure(result) && result.error.code).toBe('EMAIL_UNVERIFIED');
    });

    it('allows an unverified regular actor only through the authenticated context', async () => {
        (auth as jest.Mock).mockResolvedValue({ user: { id: 'student', isAdmin: false, emailVerified: null } });
        const authenticated = await requireAuthenticatedActionContext();
        expect(isActionFailure(authenticated)).toBe(false);

        const verified = await requireVerifiedUserActionContext();
        expect(isActionFailure(verified) && verified.error.code).toBe('EMAIL_UNVERIFIED');
    });
});
