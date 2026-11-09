import { login } from '@/actions/auth/login';
import { logout } from '@/actions/auth/logout';
import { register } from '@/actions/auth/register';
import { sendVerificationToken, verifyEmail } from '@/actions/auth/verification-token';
import { auth, signIn, signOut } from '@/auth';
import { registerUser } from '@/services/user';
import { getVerificationTokenByToken, requestEmailVerification } from '@/services/verification-token';
import { AuthError } from 'next-auth';
import { UserExistError } from '@/exceptions/user-exist';

jest.mock('@/auth', () => ({ auth: jest.fn(), signIn: jest.fn(), signOut: jest.fn() }));
jest.mock('@/services/user', () => ({ registerUser: jest.fn(), getUserByEmail: jest.fn(), editUserById: jest.fn() }));
jest.mock('@/services/verification-token', () => ({
    getVerificationTokenByToken: jest.fn(),
    removeVerificationToken: jest.fn(),
    requestEmailVerification: jest.fn(),
}));

const registration = {
    name: 'Nombre', lastName: 'Apellido', email: 'user@example.com', phoneNumber: '3001234567',
    password: 'Password1', confirmPassword: 'Password1', checkTerms: true,
    identification: '123456', identificationType: 'CC',
};

describe('legacy identity action contracts', () => {
    beforeEach(() => jest.clearAllMocks());

    it('validates login input before calling the provider', async () => {
        await expect(login({ email: 'invalid', password: '' })).resolves.toMatchObject({ ok: false, error: { code: 'VALIDATION' } });
        expect(signIn).not.toHaveBeenCalled();
        expect(auth).not.toHaveBeenCalled();
    });

    it('maps invalid credentials without exposing the provider error', async () => {
        const invalidCredentials = new AuthError('private provider detail');
        invalidCredentials.type = 'CredentialsSignin';
        (signIn as jest.Mock).mockRejectedValue(invalidCredentials);

        await expect(login({ email: registration.email, password: registration.password })).resolves.toEqual({
            ok: false, error: { code: 'UNAUTHENTICATED', message: 'Credenciales inválidas.' },
        });
        expect(auth).not.toHaveBeenCalled();
    });

    it('maps other NextAuth failures to a generic unexpected error', async () => {
        (signIn as jest.Mock).mockRejectedValue(new AuthError('private provider detail'));

        await expect(login({ email: registration.email, password: registration.password })).resolves.toEqual({
            ok: false, error: { code: 'UNEXPECTED', message: 'No fue posible iniciar sesión.' },
        });
    });

    it('clears an expired session without resolving an actor', async () => {
        (auth as jest.Mock).mockRejectedValue(new Error('session expired'));
        (signOut as jest.Mock).mockResolvedValue(undefined);
        await expect(logout()).resolves.toEqual({ ok: true, data: null, message: 'Ha cerrado sesión correctamente.' });
        expect(auth).not.toHaveBeenCalled();
    });

    it('does not expose provider failures while logging out', async () => {
        (signOut as jest.Mock).mockRejectedValue(new Error('private provider detail'));
        await expect(logout()).resolves.toEqual({
            ok: false, error: { code: 'UNEXPECTED', message: 'No fue posible cerrar sesión.' },
        });
    });

    it('validates public registration and returns ActionResult', async () => {
        (registerUser as jest.Mock).mockResolvedValue({ id: 'user-1' });
        await expect(register(registration)).resolves.toMatchObject({ ok: true, data: null });
        expect(registerUser).toHaveBeenCalledWith(expect.objectContaining({ email: registration.email, checkTerms: true }));
        expect(auth).not.toHaveBeenCalled();
    });

    it('maps duplicate registration to CONFLICT without exposing the identifier', async () => {
        (registerUser as jest.Mock).mockRejectedValue(new UserExistError('private identity'));
        await expect(register(registration)).resolves.toEqual({
            ok: false, error: { code: 'CONFLICT', message: 'No fue posible crear el usuario.' },
        });
        expect(auth).not.toHaveBeenCalled();
    });

    it('returns the same neutral acknowledgement for existing and unknown accounts', async () => {
        (requestEmailVerification as jest.Mock).mockResolvedValue(undefined);
        const existing = await sendVerificationToken({ email: registration.email });

        (requestEmailVerification as jest.Mock).mockRejectedValue(new Error('Unknown account'));
        const unknown = await sendVerificationToken({ email: 'unknown@example.com' });

        expect(existing).toEqual(unknown);
        expect(auth).not.toHaveBeenCalled();
    });

    it('does not expose an expired verification token as a successful action', async () => {
        (getVerificationTokenByToken as jest.Mock).mockResolvedValue({ token: 'expired', email: registration.email, expires: new Date('2000-01-01') });
        await expect(verifyEmail({ token: 'expired' })).resolves.toMatchObject({ ok: false, error: { code: 'NOT_FOUND' } });
    });
});
