'use server';

import { deactivateCourse } from '@/services/courses';
import { actionFailure, actionSuccess, type ActionResult } from '@/interfaces/actions/action-result';
import { withAdminAction } from '@/interfaces/actions/action-context';
import { CourseIdInputSchema } from '@/interfaces/actions/admin.contract';
import { validateActionInput } from '@/interfaces/actions/validation';

export async function deactivate(input: unknown): Promise<ActionResult<null>> {
    const parsedInput = validateActionInput(CourseIdInputSchema, input);
    if (!parsedInput.ok) return parsedInput;

    return withAdminAction(async () => {
        try {
            const deactivated = await deactivateCourse(parsedInput.data.id);
            return deactivated
                ? actionSuccess(null, 'Curso desactivado correctamente.')
                : actionFailure('NOT_FOUND', 'No se pudo desactivar el curso.');
        } catch {
            return actionFailure('UNEXPECTED', 'No fue posible desactivar el curso.');
        }
    });
}
