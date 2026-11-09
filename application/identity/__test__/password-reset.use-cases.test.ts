import { requestPasswordReset, resetPasswordWithToken } from '@/application/identity/password-reset.use-cases';

describe('password-reset use cases', () => {
    it('does not issue a token or notify when the account is absent', async () => {
        const accounts = { findByEmail: jest.fn().mockResolvedValue(null) };
        const tokenIssuer = { issueForEmail: jest.fn() };
        const notifier = { sendPasswordResetLink: jest.fn() };

        await requestPasswordReset({ email: 'missing@example.com' }, { accounts, tokenIssuer, notifier });

        expect(tokenIssuer.issueForEmail).not.toHaveBeenCalled();
        expect(notifier.sendPasswordResetLink).not.toHaveBeenCalled();
    });

    it('issues and notifies for an existing account', async () => {
        const accounts = { findByEmail: jest.fn().mockResolvedValue({ email: 'user@example.com' }) };
        const tokenIssuer = { issueForEmail: jest.fn().mockResolvedValue({ email: 'user@example.com', token: 'token', expires: new Date() }) };
        const notifier = { sendPasswordResetLink: jest.fn() };

        await requestPasswordReset({ email: 'user@example.com' }, { accounts, tokenIssuer, notifier });

        expect(notifier.sendPasswordResetLink).toHaveBeenCalledWith({ email: 'user@example.com', token: 'token' });
    });

    it.each(['invalid_token', 'expired_token', 'user_missing', 'success'] as const)(
        'returns the credential-store outcome %s without reinterpretation',
        async (status) => {
            const credentials = { consumeTokenAndSetPassword: jest.fn().mockResolvedValue({ status }) };
            const passwordHasher = { hash: jest.fn().mockResolvedValue('password-hash') };

            await expect(resetPasswordWithToken({ token: 'token', password: 'Password1' }, { credentials, passwordHasher })).resolves.toEqual({ status });
            expect(credentials.consumeTokenAndSetPassword).toHaveBeenCalledWith({ token: 'token', passwordHash: 'password-hash' });
        },
    );
});
