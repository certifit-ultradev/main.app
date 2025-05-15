"use server";

import { signOut } from "@/auth";
import { mapErrorToServerActionResponse } from "@/exceptions/error-encoder";
import { ServerActionResponse } from "@/utils/types";
import { isRedirectError } from "next/dist/client/components/redirect-error";

/**
 * 
 * @param param0 
 * @param callbackUrl 
 * @returns 
 */
export const logout = async (): Promise<ServerActionResponse<null>> => {
    try {
        await signOut({
            redirectTo: "/login",
        });
        return { success: true, message: "Ha cerrado sesión correctamente!" };
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }
        return mapErrorToServerActionResponse(error);
    }
}