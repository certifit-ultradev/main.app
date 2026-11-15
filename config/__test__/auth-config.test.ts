import { authConfig, toVerifiedDate } from '@/auth.config';
import { REMEMBERED_SESSION_SECONDS, SESSION_WITHOUT_REMEMBER_SECONDS } from '@/shared/auth/session-lifetime';

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

describe('remembered session lifetime', () => {
    afterEach(() => jest.useRealTimers());

    it.each([
        [false, SESSION_WITHOUT_REMEMBER_SECONDS],
        [true, REMEMBERED_SESSION_SECONDS],
    ])('enforces the selected deadline in the server JWT callback', async (rememberMe, seconds) => {
        jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
        const jwt = authConfig.callbacks?.jwt;
        const session = authConfig.callbacks?.session;
        if (!jwt || !session) throw new Error('Auth callbacks missing');

        const token = await jwt({
            token: { sub: 'user-1' },
            user: { id: 'user-1', isAdmin: false, emailVerified: null, rememberMe },
            account: null, trigger: 'signIn', isNewUser: false,
        } as never);
        expect(token).not.toBeNull();
        expect(token?.sessionDeadline).toBe(Date.now() + seconds * 1000);

        const visibleSession = await session({
            session: { user: { name: 'User' }, expires: new Date(Date.now() + REMEMBERED_SESSION_SECONDS * 1000).toISOString() },
            token,
        } as never);
        expect(visibleSession.expires).toBe(new Date(Date.now() + seconds * 1000).toISOString());
        expect(visibleSession.user).not.toHaveProperty('rememberMe');
        expect(visibleSession.user).not.toHaveProperty('sessionDeadline');

        jest.setSystemTime(Date.now() + seconds * 1000);
        expect(await jwt({ token } as never)).toBeNull();
    });
});
