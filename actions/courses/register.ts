'use server';

import { editCourse, registerCourse, updateClassVideoPath } from '@/services/courses';
import type { CourseEditorDto } from '@/application/courses/course.dto';
import { actionFailure, actionSuccess, type ActionResult } from '@/interfaces/actions/action-result';
import { withAdminAction } from '@/interfaces/actions/action-context';
import {
    AdminCourseInputSchema,
    UpdateAdminCourseInputSchema,
    UpdateClassVideoInputSchema,
} from '@/interfaces/actions/admin.contract';
import { validateActionInput } from '@/interfaces/actions/validation';
import { toCourseEditorPatch, toCreateCourseCommand } from '@/interfaces/actions/course-editor.mapper';

export async function register(input: unknown): Promise<ActionResult<CourseEditorDto>> {
    const parsedInput = validateActionInput(AdminCourseInputSchema, input);
    if (!parsedInput.ok) return parsedInput;

    return withAdminAction(async () => {
        try {
            const course = await registerCourse(toCreateCourseCommand(parsedInput.data));
            if (!course) return actionFailure('UNEXPECTED', 'No se pudo crear el curso.');

            return actionSuccess(course, 'Curso creado correctamente.');
        } catch {
            return actionFailure('UNEXPECTED', 'No fue posible crear el curso.');
        }
    });
}

export async function edit(input: unknown): Promise<ActionResult<null>> {
    const parsedInput = validateActionInput(UpdateAdminCourseInputSchema, input);
    if (!parsedInput.ok) return parsedInput;

    return withAdminAction(async () => {
        try {
            await editCourse(parsedInput.data.courseId, toCourseEditorPatch(parsedInput.data.patch));
            return actionSuccess(null, 'Curso editado correctamente.');
        } catch {
            return actionFailure('UNEXPECTED', 'No fue posible editar el curso.');
        }
    });
}

export async function editClassVideoPath(input: unknown): Promise<ActionResult<null>> {
    const parsedInput = validateActionInput(UpdateClassVideoInputSchema, input);
    if (!parsedInput.ok) return parsedInput;

    return withAdminAction(async () => {
        try {
            const updated = await updateClassVideoPath(
                parsedInput.data.clsId,
                parsedInput.data.videoPath,
                parsedInput.data.videoSize,
            );
            return updated
                ? actionSuccess(null, 'Información del video de la clase modificada correctamente.')
                : actionFailure('NOT_FOUND', 'No se pudo modificar la clase.');
        } catch {
            return actionFailure('UNEXPECTED', 'No fue posible modificar la clase.');
        }
    });
}
