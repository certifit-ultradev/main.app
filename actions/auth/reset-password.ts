'use server';

import { mapErrorToServerActionResponse } from "@/exceptions/error-encoder";
import { sendPasswordResetEmail } from "@/repository/nodemailer";
import { generatePasswordResetTokenByEmail } from "@/services/password-token";
import { getUserByEmail } from "@/services/user";
import { ResetSchema } from "@/utils/schemas";
import { ServerActionResponse } from "@/utils/types";
import { z } from "zod";

/**
 * 
 * @param values 
 * @returns 
 */
export const resetPassword = async (values: z.infer<typeof ResetSchema>): Promise<ServerActionResponse<null>> => {
    try {
        const validatedFields = ResetSchema.safeParse(values);
        if (!validatedFields.success) {
            return { success: false, error: "Correo invalido" };
        }
    
        const { email } = validatedFields.data;
    
        const existingUser = await getUserByEmail(email);
    
        if (!existingUser) {
            return { success: false, error: "El correo no existe" };
        }
    
        const passwordResetToken = await generatePasswordResetTokenByEmail(email);
        if (!passwordResetToken) {
            return { success: false, error: "No se pudo generar el token" }
        }

        await sendPasswordResetEmail(
            passwordResetToken.email,
            passwordResetToken.token
        );
    
        return { success: true, message: "Correo enviado!" };    
    } catch (error) {
        return mapErrorToServerActionResponse(error);
    }
}