import { NotFoundError } from "@/exceptions/not-found";
import { prisma } from "../lib/prisma";
import { PasswordResetToken } from "../models/password-reset-token";

export const findPasswordResetTokenByToken = async (token: string) => {
    const passwordResetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
    });

    if (!passwordResetToken) {
        throw new NotFoundError('Token de cambio de contraseña no encontrado');
    }

    return new PasswordResetToken(passwordResetToken);
}

export const findPasswordResetTokenByPhoneNumber = async (email: string) => {
    const passwordResetToken = await prisma.passwordResetToken.findFirst({
        where: { email },
    });

    if (!passwordResetToken) {
        throw new NotFoundError('Token de cambio de contraseña no encontrado');
    }

    return new PasswordResetToken(passwordResetToken);
}

export const findPasswordResetTokenByEmail = async (email: string): Promise<PasswordResetToken | null> => {
    const passwordResetToken = await prisma.passwordResetToken.findFirst({
        where: { email },
    });

    if (!passwordResetToken) {
        throw new NotFoundError('Token de cambio de contraseña no encontrado');
    }

    return new PasswordResetToken(passwordResetToken);
}

export const createPasswordResetToken = async ({ email, token, expires }: PasswordResetToken): Promise<PasswordResetToken | null> => {
    if (!email) {
        throw new Error("No se pudo crear un token de verificación, el correo es invalido");
    }

    let existingToken;
    try {
        existingToken = await findPasswordResetTokenByEmail(email);
    } catch (error) {
        if (error instanceof NotFoundError) {
            if (existingToken) {
                const id = existingToken.id;
                await prisma.passwordResetToken.delete({
                    where: { id: id },
                });
            }
        }
    }

    return await prisma.passwordResetToken.create({
        data: {
            email,
            token,
            expires,
        },
    });
}

export const deletePasswordResetToken = async (id: string) => {
    return await prisma.passwordResetToken.delete({
        where: { id },
    });
}