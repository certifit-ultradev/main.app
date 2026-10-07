'use server';

import { listAdminUsers } from '@/services/user';
import type { AdminUserPageDto } from '@/application/users/user.dto';
import { actionFailure, actionSuccess, type ActionResult } from '@/interfaces/actions/action-result';
import { withAdminAction } from '@/interfaces/actions/action-context';
import { AdminPageInputSchema } from '@/interfaces/actions/admin.contract';
import { validateActionInput } from '@/interfaces/actions/validation';

export async function listAll(input: unknown): Promise<ActionResult<AdminUserPageDto>> {
    const parsedInput = validateActionInput(AdminPageInputSchema, input);
    if (!parsedInput.ok) return parsedInput;

    return withAdminAction(async () => {
        try {
            return actionSuccess(await listAdminUsers({ page: parsedInput.data.page }));
        } catch {
            return actionFailure('UNEXPECTED', 'No fue posible consultar los usuarios.');
        }
    });
}
