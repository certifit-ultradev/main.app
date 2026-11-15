'use server';

import { actionSuccess, type ActionResult } from '@/interfaces/actions/action-result';
import { PasswordResetRequestInputSchema } from '@/interfaces/actions/auth.contract';
import { validateActionInput } from '@/interfaces/actions/validation';
import { requestPasswordReset } from '@/services/password-reset';
import { safeLogger } from '@/shared/observability/safe-logger';

const neutralMessage = 'Si existe una cuenta con ese correo, recibirás instrucciones para restablecer tu contraseña.';

/** Public action: never discloses whether an email belongs to an account. */
export async function resetPassword(input: unknown): Promise<ActionResult<null>> {
    const parsedInput = validateActionInput(PasswordResetRequestInputSchema, input);
    if (!parsedInput.ok) return parsedInput;

    try {
        await requestPasswordReset(parsedInput.data.email);
    } catch {
        // Keep the externally visible response identical to avoid account enumeration.
        safeLogger.error('action.auth.password_reset.request.failed');
    }

    return actionSuccess(null, neutralMessage);
}
