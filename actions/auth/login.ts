"use server";

import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { AuthError } from 'next-auth';
import { actionFailure, actionSuccess, type ActionResult } from '@/interfaces/actions/action-result';
import { LoginInputSchema } from '@/interfaces/actions/auth.contract';
import { validateActionInput } from '@/interfaces/actions/validation';

/**
 * 
 * @param param0 
 * @param callbackUrl 
 * @returns 
 */
/** Public action: invalid and unverified credentials receive the same response. */
export const login = async (input: unknown): Promise<ActionResult<null>> => {
    const parsedInput = validateActionInput(LoginInputSchema, input);
    if (!parsedInput.ok) return parsedInput;

    try {
        await signIn("credentials", {
            email: parsedInput.data.email,
            password: parsedInput.data.password,
            redirect: true,
            redirectTo: parsedInput.data.callbackUrl || DEFAULT_LOGIN_REDIRECT,
        });
        return actionSuccess(null, 'Ha iniciado sesión correctamente.');
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }
        if (error instanceof AuthError && error.type === 'CredentialsSignin') {
            return actionFailure('UNAUTHENTICATED', 'Credenciales inválidas.');
        }
        return actionFailure('UNEXPECTED', 'No fue posible iniciar sesión.');
    }
}
