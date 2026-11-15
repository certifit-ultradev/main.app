import { newPassword } from '@/actions/auth/new-password';
import { resetPassword } from '@/actions/auth/reset-password';
import { requestPasswordReset, resetPasswordWithToken } from '@/services/password-reset';

jest.mock('@/services/password-reset', () => ({
    requestPasswordReset: jest.fn(),
    resetPasswordWithToken: jest.fn(),
}));
jest.mock('@/auth', () => ({ auth: jest.fn() }));
jest.mock('@/services/user', () => ({ editUserById: jest.fn() }));

describe('password reset actions', () => {
    const neutralMessage = 'Si existe una cuenta con ese correo, recibirás instrucciones para restablecer tu contraseña.';

    beforeEach(() => jest.clearAllMocks());

    it('returns the same neutral response whether sending succeeds or fails', async () => {
        (requestPasswordReset as jest.Mock).mockResolvedValue(undefined);
        const known = await resetPassword({ email: 'known@example.com' });

        (requestPasswordReset as jest.Mock).mockRejectedValue(new Error('SMTP unavailable'));
        const missing = await resetPassword({ email: 'missing@example.com' });

        expect(known).toEqual({ ok: true, data: null, message: neutralMessage });
        expect(missing).toEqual({ ok: true, data: null, message: neutralMessage });
    });

    it('does not call the use case when the public input is invalid', async () => {
        await expect(resetPassword({ email: 'not-an-email' })).resolves.toMatchObject({ ok: false, error: { code: 'VALIDATION' } });
        expect(requestPasswordReset).not.toHaveBeenCalled();
    });

    it.each([
        ['invalid_token', 'El enlace de restablecimiento no es válido.'],
        ['expired_token', 'El enlace de restablecimiento expiró.'],
        ['user_missing', 'El enlace de restablecimiento no es válido.'],
    ] as const)('maps %s without changing a password', async (status, message) => {
        (resetPasswordWithToken as jest.Mock).mockResolvedValue({ status });
        const result = await newPassword({ password: 'Password1', confirmPassword: 'Password1' }, 'token');
        expect(result).toMatchObject({ ok: false, error: { code: 'NOT_FOUND', message } });
    });

    it('accepts a successful atomic password reset', async () => {
        (resetPasswordWithToken as jest.Mock).mockResolvedValue({ status: 'success' });
        await expect(newPassword({ password: 'Password1', confirmPassword: 'Password1' }, 'token')).resolves.toMatchObject({ ok: true });
    });
});
