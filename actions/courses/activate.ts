'use server';

import { activateCourse } from '@/services/courses';
import { actionFailure, actionSuccess, type ActionResult } from '@/interfaces/actions/action-result';
import { withAdminAction } from '@/interfaces/actions/action-context';
import { CourseIdInputSchema } from '@/interfaces/actions/admin.contract';
import { validateActionInput } from '@/interfaces/actions/validation';
import { safeLogger } from '@/shared/observability/safe-logger';

export async function activate(input: unknown): Promise<ActionResult<null>> {
    const parsedInput = validateActionInput(CourseIdInputSchema, input);
    if (!parsedInput.ok) return parsedInput;

    return withAdminAction(async () => {
        try {
            const result = await activateCourse(parsedInput.data.id);
            return result.success
                ? actionSuccess(null, result.message)
                : actionFailure('VALIDATION', result.message);
        } catch {
            safeLogger.error('action.course.activate.failed', { courseId: parsedInput.data.id });
            return actionFailure('UNEXPECTED', 'No fue posible activar el curso.');
        }
    });
}
