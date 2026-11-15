'use server';

import { getEditorCourseById, getEditorCoursePage } from '@/services/courses';
import type { CourseEditorDto } from '@/application/courses/course.dto';
import type { CourseEditorPageDto } from '@/application/courses/course-read.ports';
import { actionFailure, actionSuccess, type ActionResult } from '@/interfaces/actions/action-result';
import { withAdminAction } from '@/interfaces/actions/action-context';
import { AdminPageInputSchema, CourseIdInputSchema } from '@/interfaces/actions/admin.contract';
import { validateActionInput } from '@/interfaces/actions/validation';
import { safeLogger } from '@/shared/observability/safe-logger';

export async function listAll(input: unknown): Promise<ActionResult<CourseEditorPageDto>> {
    const parsedInput = validateActionInput(AdminPageInputSchema, input);
    if (!parsedInput.ok) return parsedInput;

    return withAdminAction(async () => {
        try {
            const coursesPaged = await getEditorCoursePage({ page: parsedInput.data.page });
            return actionSuccess<CourseEditorPageDto>(coursesPaged);
        } catch {
            safeLogger.error('action.course.list.failed');
            return actionFailure('UNEXPECTED', 'No fue posible consultar los cursos.');
        }
    });
}

export async function getCourseDataById(input: unknown): Promise<ActionResult<CourseEditorDto>> {
    const parsedInput = validateActionInput(CourseIdInputSchema, input);
    if (!parsedInput.ok) return parsedInput;

    return withAdminAction(async () => {
        try {
            const course = await getEditorCourseById(parsedInput.data.id);
            if (!course) return actionFailure('NOT_FOUND', 'El curso no existe.');
            return actionSuccess(course);
        } catch {
            safeLogger.error('action.course.get_by_id.failed', { courseId: parsedInput.data.id });
            return actionFailure('UNEXPECTED', 'No fue posible consultar el curso.');
        }
    });
}
