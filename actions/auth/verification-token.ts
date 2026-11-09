"use server";

import { editUserById, getUserByEmail } from "@/services/user";
import { getVerificationTokenByToken, removeVerificationToken, requestEmailVerification } from "@/services/verification-token";
import { actionFailure, actionSuccess, type ActionResult } from '@/interfaces/actions/action-result';
import { VerificationEmailInputSchema, VerificationTokenInputSchema } from '@/interfaces/actions/auth.contract';
import { validateActionInput } from '@/interfaces/actions/validation';
import { safeLogger } from '@/shared/observability/safe-logger';

/**
 * 
 * @param email 
 * @returns 
 */
/** Public action: its acknowledgement does not reveal account state. */
export const sendVerificationToken = async (input: unknown): Promise<ActionResult<null>> => {
    const parsedInput = validateActionInput(VerificationEmailInputSchema, input);
    if (!parsedInput.ok) return parsedInput;

    try {
        await requestEmailVerification(parsedInput.data.email);
    } catch {
        // Public response remains identical for delivery failures and unknown accounts.
        safeLogger.error('action.auth.verification.request.failed');
    }
    return actionSuccess(null, 'Si existe una cuenta pendiente de verificación, recibirás un correo de activación.');
}

/**
 * 
 * @param token 
 * @returns 
 */
/** Public action authorized by a one-time token rather than a login session. */
export const verifyEmail = async (input: unknown): Promise<ActionResult<null>> => {
    const parsedInput = validateActionInput(VerificationTokenInputSchema, input);
    if (!parsedInput.ok) return parsedInput;

    try {
        const existingToken = await getVerificationTokenByToken(parsedInput.data.token);

        if (!existingToken) {
            return actionFailure('NOT_FOUND', 'El enlace de verificación no es válido o expiró.');
        }

        const hasExpired = new Date(existingToken.expires) < new Date();
        if (hasExpired) {
            return actionFailure('NOT_FOUND', 'El enlace de verificación no es válido o expiró.');
        }

        const existingUser = await getUserByEmail(existingToken.email);
        if (!existingUser) {
            return actionFailure('NOT_FOUND', 'El enlace de verificación no es válido o expiró.');
        }

        const confirmEmail = await editUserById(existingUser.id, {
            emailVerified: new Date(),
            email: existingToken.email,
        });

        if (confirmEmail && existingToken.id) {
            await removeVerificationToken(existingToken.id);
        }

        return actionSuccess(null, 'Email verificado.');
    } catch {
        safeLogger.error('action.auth.verification.confirm.failed');
        return actionFailure('UNEXPECTED', 'No fue posible verificar el correo.');
    }
}
