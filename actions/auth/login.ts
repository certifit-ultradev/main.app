"use server";

import { signIn } from "@/auth";
import { LoginForm, ServerActionResponse } from "@/utils/types";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { mapErrorToServerActionResponse } from "@/exceptions/error-encoder";

/**
 * 
 * @param param0 
 * @param callbackUrl 
 * @returns 
 */
export const login = async ({ email, password }: LoginForm, callbackUrl?: string | null): Promise<ServerActionResponse<null>> => {
    try {
        await signIn("credentials", {
            email,
            password,
            redirect: true,
            redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
        });
        return { success: true, message: "Ha iniciado sesión correctamente!" };
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }

        return mapErrorToServerActionResponse(error);
    }
}