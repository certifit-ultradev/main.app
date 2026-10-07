import { prisma } from "../lib/prisma";
import type { NewPasswordResetToken, PasswordResetTokenRecord } from '@/application/identity/identity-token.records';
import type { PasswordResetConsumption } from '@/application/identity/password-reset.ports';

/**
 * 
 * @param token 
 * @returns 
 */
export const findPasswordResetTokenByToken = async (token: string): Promise<PasswordResetTokenRecord | null> => {
    const passwordResetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
    });

    return passwordResetToken;
}

/**
 * 
 * @param email 
 * @returns 
 */
export const findPasswordResetTokenByEmail = async (email: string): Promise<PasswordResetTokenRecord | null> => {
    const passwordResetToken = await prisma.passwordResetToken.findFirst({
        where: { email },
    });

    return passwordResetToken;
}

/**
 * 
 * @param email 
 * @param token 
 * @param expires 
 * @returns 
 */
export const createPasswordResetToken = async ({ email, token, expires }: NewPasswordResetToken): Promise<PasswordResetTokenRecord | null> => {
    if (!email) {
        throw new Error("No se pudo crear un token de verificación, el correo es invalido");
    }

    const existingToken = await findPasswordResetTokenByEmail(email);

    if (existingToken?.id) {
        await prisma.passwordResetToken.delete({
            where: { id: existingToken.id },
        });
    }

    return await prisma.passwordResetToken.create({
        data: {
            email,
            token,
            expires,
        },
    });
}

/**
 * 
 * @param token 
 * @returns 
 */
export const deletePasswordResetToken = async (token: string): Promise<PasswordResetTokenRecord> => {
    return await prisma.passwordResetToken.delete({
        where: { token },
    });
}

/**
 * Changes the password before consuming the reset token in one transaction.
 * If updating the user or deleting the token fails, Prisma rolls both changes back.
 */
export async function consumePasswordResetTokenAndUpdatePassword(
    token: string,
    passwordHash: string,
    now: Date = new Date(),
): Promise<PasswordResetConsumption> {
    return prisma.$transaction(async (transaction) => {
        const resetToken = await transaction.passwordResetToken.findUnique({ where: { token } });
        if (!resetToken) return { status: 'invalid_token' };
        if (resetToken.expires <= now) return { status: 'expired_token' };

        const user = await transaction.user.findFirst({ where: { email: resetToken.email } });
        if (!user) return { status: 'user_missing' };

        await transaction.user.update({
            where: { id: user.id },
            data: { password: passwordHash },
        });

        const consumed = await transaction.passwordResetToken.deleteMany({
            where: { id: resetToken.id, token },
        });
        if (consumed.count !== 1) {
            throw new Error('El token de restablecimiento ya fue consumido.');
        }

        return { status: 'success' };
    });
}
