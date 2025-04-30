"use server"

import { auth } from "@/auth";
import { mapErrorToServerActionResponse } from "@/exceptions/error-encoder";
import { UserNotLoggedError } from "@/exceptions/user-not-logged";
import { getPasswordResetTokenByToken, removePasswordResetToken } from "@/services/password-token";
import { editUserById, getUserByEmail } from "@/services/user";
import { NewPasswordSchema } from "@/utils/schemas";
import { ServerActionResponse } from "@/utils/types";
import { z } from "zod";

export const newPassword = async (
    values: z.infer<typeof NewPasswordSchema>,
    token?: string | null
): Promise<ServerActionResponse<null>> => {
    try {
        if (!token) {
            return { error: "El token no puede estar vacío!" };
        }

        const validatedFields = NewPasswordSchema.safeParse(values);
        if (!validatedFields.success) {
            return { error: "Contraseña invalida!" };
        }

        const { password } = validatedFields.data;

        const existingToken = await getPasswordResetTokenByToken(token);
        if (!existingToken) {
            return { success: false, error: "El token es invalido!" };
        }

        const hasExpired = new Date(existingToken.expires) < new Date();
        if (hasExpired) {
            return { success: false, error: "El Token a expirado" };
        }

        const existingUser = await getUserByEmail(existingToken.email);
        if (!existingUser) {
            return { success: false, error: "El correo no existe!" };
        }

        await editUserById(existingUser.id!, { password });
        await removePasswordResetToken(existingUser.id!);
        return { success: true, message: "Contraseña actualizada!" };
    } catch (error) {
        return mapErrorToServerActionResponse(error);
    }
}

export const newPasswordForLoggedUser = async (
    values: z.infer<typeof NewPasswordSchema>,
): Promise<ServerActionResponse<null>> => {
    try {
        const validatedFields = NewPasswordSchema.safeParse(values);
        if (!validatedFields.success) {
            return { error: "Contraseña invalida!" };
        }
        const { password } = validatedFields.data;

        const session = await auth();
        const userID = session?.user.id;
        if (!userID) {
            throw new UserNotLoggedError("El usuario debe loguearse");
        }

        await editUserById(userID, { password });
        return { success: true, message: "Contraseña actualizada!" };
    } catch (error) {
        return mapErrorToServerActionResponse(error);
    }
}