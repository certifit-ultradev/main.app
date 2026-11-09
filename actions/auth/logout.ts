"use server";

import { signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { actionFailure, actionSuccess, type ActionResult } from '@/interfaces/actions/action-result';
import { safeLogger } from '@/shared/observability/safe-logger';

/**
 * 
 * @param param0 
 * @param callbackUrl 
 * @returns 
 */
/** Public and idempotent: clears the provider session even if it has expired. */
export const logout = async (): Promise<ActionResult<null>> => {
    try {
        await signOut({
            redirectTo: "/login",
        });
        return actionSuccess(null, 'Ha cerrado sesión correctamente.');
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }
        safeLogger.error('action.auth.logout.failed');
        return actionFailure('UNEXPECTED', 'No fue posible cerrar sesión.');
    }
}
