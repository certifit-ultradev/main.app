import { ResetPasswordTokenResult } from "@/utils/types";
import { PasswordResetToken } from "../models/password-reset-token";
import { createPasswordResetToken, deletePasswordResetToken, findPasswordResetTokenByToken } from "../repository/password-reset-token";
import { generateExpirationToken } from "../utils/expiraton-token";
import { sendPasswordResetEmail } from "@/repository/nodemailer";
import { logPrismaError } from "@/exceptions/error-encoder";

/**
 * 
 * @param email 
 * @returns 
 */
export const generatePasswordResetTokenByEmail = async (email: string): Promise<PasswordResetToken | null> => {
    try {
        const { expires, token } = generateExpirationToken();
        return createPasswordResetToken({ email, token, expires });
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @param email 
 * @returns 
 */
export const sendPasswordResetEmailWithToken = async (email: string): Promise<ResetPasswordTokenResult> => {
    try {
        const passwordResetToken = await generatePasswordResetTokenByEmail(email);
        if (!passwordResetToken) {
            throw new Error("el token no se pudo generar");
        }

        await sendPasswordResetEmail(email, passwordResetToken.token);

        return { success: true, message: "Se envío el mensaje de activación!" };
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @param token 
 * @returns 
 */
export const getPasswordResetTokenByToken = async (token: string): Promise<PasswordResetToken | null> => {
    try {
        if (token === "") {
            throw new Error("El token no puede ser vacío");
        }

        return await findPasswordResetTokenByToken(token);
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @param token 
 * @returns 
 */
export const removePasswordResetToken = async (token: string): Promise<ResetPasswordTokenResult> => {
    try {
        const passwordResetToken = await deletePasswordResetToken(token);
        if (!passwordResetToken) {
            throw new Error("el token no se pudo borrar");
        }

        return { success: true, message: "Se borro el token" };
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}