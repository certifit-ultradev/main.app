'use server';

import { activateCourse } from '@/services/courses';
import { actionFailure, actionSuccess, type ActionResult } from '@/interfaces/actions/action-result';
import { withAdminAction } from '@/interfaces/actions/action-context';
import { CourseIdInputSchema } from '@/interfaces/actions/admin.contract';
import { validateActionInput } from '@/interfaces/actions/validation';

export async function activate(input: unknown): Promise<ActionResult<null>> {
    const parsedInput = validateActionInput(CourseIdInputSchema, input);
    if (!parsedInput.ok) return parsedInput;

    return withAdminAction(async () => {
        try {
            const result = await activateCourse(parsedInput.data.id);
            return result
                ? actionSuccess(null, result.message)
                : actionFailure('NOT_FOUND', 'No se pudo activar el curso.');
        } catch {
            return actionFailure('UNEXPECTED', 'No fue posible activar el curso.');
        }
    });
}
