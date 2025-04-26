"use server";

import { mapErrorToServerActionResponse } from "@/exceptions/error-encoder";
import { registerUser } from "@/services/user";
import { ServerActionResponse, UserCreateData } from "@/utils/types"

export const register = async (data: UserCreateData): Promise<ServerActionResponse<null>> => {
    try {
        const user = await registerUser({
            ...data,
            checkTerms: true
        });
        if (!user) {
            return { success: false, error: "No se pudo crear el usuario." }
        }

        return { success: true, message: "Usuario creado correctamente." }
    } catch (error) {
        return mapErrorToServerActionResponse(error);
    }
}