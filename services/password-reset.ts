import {
    requestPasswordReset as requestPasswordResetUseCase,
    resetPasswordWithToken as resetPasswordWithTokenUseCase,
} from '@/application/identity/password-reset.use-cases';
import type { PasswordResetConsumption } from '@/application/identity/password-reset.ports';
import { nodemailerEmailGateway } from '@/infrastructure/notifications/nodemailer-email-gateway';
import { consumePasswordResetTokenAndUpdatePassword, createPasswordResetToken } from '@/repository/password-reset-token';
import { getUserByEmail } from '@/services/user';
import { ONE_HOUR_IDENTITY_TOKEN_TTL } from '@/application/identity/identity-token.ports';
import { uuidIdentityTokenGenerator } from '@/infrastructure/identity/uuid-identity-token-generator';
import { bcryptPasswordHasher } from '@/infrastructure/identity/bcrypt-password-hasher';

export async function requestPasswordReset(email: string): Promise<void> {
    await requestPasswordResetUseCase({ email }, {
        accounts: {
            async findByEmail(candidateEmail) {
                try {
                    const user = await getUserByEmail(candidateEmail);
                    return user ? { email: user.email } : null;
                } catch {
                    return null;
                }
            },
        },
        tokenIssuer: {
            async issueForEmail(accountEmail) {
                const { token, expires } = uuidIdentityTokenGenerator.generate(ONE_HOUR_IDENTITY_TOKEN_TTL);
                const issued = await createPasswordResetToken({ email: accountEmail, token, expires });
                if (!issued) throw new Error('No fue posible crear el token de restablecimiento.');
                return issued;
            },
        },
        notifier: nodemailerEmailGateway,
    });
}

export async function resetPasswordWithToken(input: { token: string; password: string }): Promise<PasswordResetConsumption> {
    return resetPasswordWithTokenUseCase(input, {
        credentials: {
            consumeTokenAndSetPassword: ({ token, passwordHash }) => consumePasswordResetTokenAndUpdatePassword(token, passwordHash),
        },
        passwordHasher: bcryptPasswordHasher,
    });
}
