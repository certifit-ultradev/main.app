'use server';

import { getAdminUserById, userExistsByEmail } from '@/services/user';
import type { AdminUserDto } from '@/application/users/user.dto';
import { actionFailure, actionSuccess, type ActionResult } from '@/interfaces/actions/action-result';
import { withAdminAction } from '@/interfaces/actions/action-context';
import { AdminEmailInputSchema, UserIdInputSchema } from '@/interfaces/actions/admin.contract';
import { validateActionInput } from '@/interfaces/actions/validation';
import { safeLogger } from '@/shared/observability/safe-logger';

export async function fetchUserByEmail(input: unknown): Promise<ActionResult<null>> {
    const parsedInput = validateActionInput(AdminEmailInputSchema, input);
    if (!parsedInput.ok) return parsedInput;

    return withAdminAction(async () => {
        try {
            return await userExistsByEmail(parsedInput.data.email)
                ? actionFailure('CONFLICT', 'Ya existe un usuario con este correo.')
                : actionSuccess(null);
        } catch {
            safeLogger.error('action.user.email_exists.failed');
            return actionFailure('UNEXPECTED', 'No fue posible verificar el correo electrónico.');
        }
    });
}

export async function fetchUserById(input: unknown): Promise<ActionResult<AdminUserDto>> {
    const parsedInput = validateActionInput(UserIdInputSchema, input);
    if (!parsedInput.ok) return parsedInput;

    return withAdminAction(async () => {
        try {
            const user = await getAdminUserById(parsedInput.data.id);
            if (!user) return actionFailure('NOT_FOUND', 'El usuario no existe.');
            return actionSuccess(user);
        } catch {
            safeLogger.error('action.user.get_by_id.failed');
            return actionFailure('UNEXPECTED', 'No fue posible consultar el usuario.');
        }
    });
}
