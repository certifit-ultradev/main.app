"use server";

import { registerUser } from "@/services/user";
import { UserExistError } from '@/exceptions/user-exist';
import { actionFailure, actionSuccess, type ActionResult } from '@/interfaces/actions/action-result';
import { RegisterAccountInputSchema } from '@/interfaces/actions/auth.contract';
import { validateActionInput } from '@/interfaces/actions/validation';
import { safeLogger } from '@/shared/observability/safe-logger';

/**
 * 
 * @param data 
 * @returns 
 */
/** Public action: validation and duplicate-record conflicts use closed error codes. */
export const register = async (input: unknown): Promise<ActionResult<null>> => {
    const parsedInput = validateActionInput(RegisterAccountInputSchema, input);
    if (!parsedInput.ok) return parsedInput;

    try {
        const user = await registerUser(parsedInput.data);
        if (!user) {
            return actionFailure('UNEXPECTED', 'No se pudo crear el usuario.');
        }

        return actionSuccess(null, 'Usuario creado correctamente.');
    } catch (error) {
        if (error instanceof UserExistError) {
            return actionFailure('CONFLICT', 'No fue posible crear el usuario.');
        }
        safeLogger.error('action.auth.register.failed');
        return actionFailure('UNEXPECTED', 'No fue posible crear el usuario.');
    }
}
