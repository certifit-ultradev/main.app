import { VerificationToken } from "@/models/verification-token";
import { generateExpirationToken } from "@/utils/expiraton-token";
import { createVerificationToken, deleteVerificationToken, findVerificationTokenByToken } from "@/repository/verification-token";
import { VerificationTokenResult } from "@/utils/types";
import { sendVerificationEmail } from "@/repository/nodemailer";
import { logPrismaError } from "@/exceptions/error-encoder";

export const generateVerificationTokenByEmail = async (email: string): Promise<VerificationToken | null> => {
    try {
        const { expires, token } = generateExpirationToken();

        return createVerificationToken({ email, token, expires });
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

export const getVerificationTokenByToken = async (token: string): Promise<VerificationToken | null> => {
    try {
        if (token === "") {
            throw new Error("El token de verificación no puede ser vacío");
        }

        return await findVerificationTokenByToken(token);
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

export const sendVerificationEmailWithToken = async (email: string): Promise<VerificationTokenResult> => {
    try {
        const verificationToken = await generateVerificationTokenByEmail(email);
        if (!verificationToken) {
            throw new Error("el token no se pudo generar");
        }

        await sendVerificationEmail(email, verificationToken.token);

        return { success: true, message: "Se envío el mensaje de activación!" };
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

export const removeVerificationToken = async (id: string): Promise<VerificationTokenResult> => {
    try {
        const verificationToken = await deleteVerificationToken(id);
        if (!verificationToken) {
            throw new Error("el token no se ´pudo borrar");
        }

        return { success: true, message: "Se borro el token" };
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}