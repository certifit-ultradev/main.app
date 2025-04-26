"use server";

import { getUserByEmail } from "@/services/user";
import { ServerActionResponse } from "@/utils/types";

export const checkIfUserIsActive = async (email: string): Promise<ServerActionResponse<null>> => {
    try {
        const user = await getUserByEmail(email);
        return {
            success: user?.emailVerified ?? false,
        }
    } catch (error) {
        console.error('Error al verificar si el usuario activado:', error);
        return {
            success: false,
            message: 'Ocurrió un error al procesar tu solicitud.',
        };
    }
}