'use server';

import { editUserById } from '@/services/user';
import { actionFailure, actionSuccess, type ActionResult } from '@/interfaces/actions/action-result';
import { withAuthenticatedAction } from '@/interfaces/actions/action-context';
import { NewPasswordInputSchema, ResetPasswordWithTokenInputSchema } from '@/interfaces/actions/auth.contract';
import { validateActionInput } from '@/interfaces/actions/validation';
import { resetPasswordWithToken } from '@/services/password-reset';
import { safeLogger } from '@/shared/observability/safe-logger';

/** Public reset action authorized by a one-time token. */
export async function newPassword(values: unknown, token?: unknown): Promise<ActionResult<null>> {
    const parsedInput = validateActionInput(ResetPasswordWithTokenInputSchema, {
        ...(typeof values === 'object' && values !== null ? values : {}),
        token,
    });
    if (!parsedInput.ok) return parsedInput;

    try {
        const result = await resetPasswordWithToken({
            token: parsedInput.data.token,
            password: parsedInput.data.password,
        });

        switch (result.status) {
            case 'success':
                return actionSuccess(null, 'Contraseña actualizada correctamente.');
            case 'expired_token':
                return actionFailure('NOT_FOUND', 'El enlace de restablecimiento expiró.');
            case 'invalid_token':
            case 'user_missing':
                return actionFailure('NOT_FOUND', 'El enlace de restablecimiento no es válido.');
        }
    } catch {
        safeLogger.error('action.auth.password_reset.consume.failed');
        return actionFailure('UNEXPECTED', 'No fue posible actualizar la contraseña.');
    }
}

/** Authenticated action: resolve the immutable actor once before editing. */
export async function newPasswordForLoggedUser(input: unknown): Promise<ActionResult<null>> {
    const parsedInput = validateActionInput(NewPasswordInputSchema, input);
    if (!parsedInput.ok) return parsedInput;

    return withAuthenticatedAction(async ({ actor }) => {
        try {
            await editUserById(actor.userId, { password: parsedInput.data.password });
            return actionSuccess(null, 'Contraseña actualizada correctamente.');
        } catch {
            safeLogger.error('action.auth.password_change.failed');
            return actionFailure('UNEXPECTED', 'No fue posible actualizar la contraseña.');
        }
    });
}
