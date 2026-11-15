import type {
    PasswordResetAccountReader,
    PasswordResetConsumption,
    PasswordResetCredentialStore,
    PasswordResetNotificationPort,
    PasswordResetTokenIssuer,
} from './password-reset.ports';
import type { PasswordHasher } from './password-hasher.port';

export async function requestPasswordReset(
    input: { email: string },
    dependencies: {
        accounts: PasswordResetAccountReader;
        tokenIssuer: PasswordResetTokenIssuer;
        notifier: PasswordResetNotificationPort;
    },
): Promise<void> {
    const account = await dependencies.accounts.findByEmail(input.email);
    if (!account) return;

    const issuedToken = await dependencies.tokenIssuer.issueForEmail(account.email);
    await dependencies.notifier.sendPasswordResetLink({
        email: issuedToken.email,
        token: issuedToken.token,
    });
}

export async function resetPasswordWithToken(
    input: { token: string; password: string },
    dependencies: { credentials: PasswordResetCredentialStore; passwordHasher: PasswordHasher },
): Promise<PasswordResetConsumption> {
    const passwordHash = await dependencies.passwordHasher.hash(input.password);
    return dependencies.credentials.consumeTokenAndSetPassword({ token: input.token, passwordHash });
}
