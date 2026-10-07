import { newPasswordForLoggedUser } from '@/actions/auth/new-password';
import { auth } from '@/auth';
import { editUserById } from '@/services/user';

jest.mock('@/auth', () => ({ auth: jest.fn() }));
jest.mock('@/services/user', () => ({ editUserById: jest.fn(), getUserByEmail: jest.fn() }));

describe('newPasswordForLoggedUser authentication', () => {
    const values = { password: 'ValidPassword1', confirmPassword: 'ValidPassword1' };

    beforeEach(() => jest.clearAllMocks());

    it('returns an authentication error without a session', async () => {
        (auth as jest.Mock).mockResolvedValue(null);
        await expect(newPasswordForLoggedUser(values)).resolves.toMatchObject({ ok: false, error: { code: 'UNAUTHENTICATED' } });
        expect(editUserById).not.toHaveBeenCalled();
    });

    it('allows an authenticated user whose email is not verified', async () => {
        (auth as jest.Mock).mockResolvedValue({ user: { id: 'user-1', emailVerified: null, isAdmin: false } });
        (editUserById as jest.Mock).mockResolvedValue({ id: 'user-1' });
        await expect(newPasswordForLoggedUser(values)).resolves.toMatchObject({ ok: true });
        expect(auth).toHaveBeenCalledTimes(1);
        expect(editUserById).toHaveBeenCalledWith('user-1', { password: values.password });
    });
});
