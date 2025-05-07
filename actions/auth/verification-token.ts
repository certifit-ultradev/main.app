"use server";

import { mapErrorToServerActionResponse } from "@/exceptions/error-encoder";
import { editUserById, getUserByEmail } from "@/services/user";
import { getVerificationTokenByToken, removeVerificationToken, sendVerificationEmailWithToken } from "@/services/verification-token";
import { ServerActionResponse } from "@/utils/types"


export const sendVerificationToken = async (email: string): Promise<ServerActionResponse<null>> => {
    try {
        const verifyToken = await sendVerificationEmailWithToken(email);
        if (!verifyToken.success) {
            return {
                success: false,
                error: "Fallo la verificación"
            };
        }

        return {
            success: true,
            message: "Se ha enviado correctamente el correo de activación."
        };
    } catch (error) {
        return mapErrorToServerActionResponse(error);
    }
}

export const verifyEmail = async (token: string): Promise<ServerActionResponse<null>> => {
    try {
        const existingToken = await getVerificationTokenByToken(token);

        if (!existingToken) {
            return {
                success: false,
                error: "El token no existe"
            };
        }

        const hasExpired = new Date(existingToken.expires) < new Date();
        if (hasExpired) {
            return {
                success: false,
                error: "El token ya expiro!"
            };
        }

        const existingUser = await getUserByEmail(existingToken.email);
        if (!existingUser) {
            return {
                success: false,
                error: "El correo no existe!"
            };
        }

        const confirmEmail = await editUserById(existingUser.id!, {
            emailVerified: new Date(),
            email: existingToken.email,
        });

        if (confirmEmail && existingToken.id) {
            const result = await removeVerificationToken(existingToken.id);
            if (!result.success) {
                return { success: false, message: "Ocurrio un error" };
            }
        }

        return { success: true, message: "Email verificado!" };
    } catch (error) {
        return mapErrorToServerActionResponse(error);
    }
}