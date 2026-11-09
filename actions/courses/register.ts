'use server';

import { createCourseDraft, editCourse, queueUnusedCourseAssets, registerCourse, saveCourseContent, updateClassVideoPath, updateCourseBasics } from '@/services/courses';
import type { CourseEditorDto } from '@/application/courses/course.dto';
import { actionFailure, actionSuccess, type ActionResult } from '@/interfaces/actions/action-result';
import { withAdminAction } from '@/interfaces/actions/action-context';
import {
    AdminCourseInputSchema,
    AdminCourseBasicsInputSchema,
    SaveAdminCourseContentInputSchema,
    QueueUnusedCourseAssetsInputSchema,
    UpdateAdminCourseBasicsInputSchema,
    UpdateAdminCourseInputSchema,
    UpdateClassVideoInputSchema,
} from '@/interfaces/actions/admin.contract';
import { validateActionInput } from '@/interfaces/actions/validation';
import { toCourseBasicsCommand, toCourseBasicsPatchCommand, toCourseContentCommand, toCourseEditorPatch, toCreateCourseCommand } from '@/interfaces/actions/course-editor.mapper';
import { safeLogger } from '@/shared/observability/safe-logger';

const logCourseActionError = (event: string, error: unknown, courseId?: number) => {
    // Do not log input, Blob URLs or exception messages: they may contain user data.
    safeLogger.error(event, { courseId, name: error instanceof Error ? error.name : 'unknown' });
};

export async function createDraft(input: unknown): Promise<ActionResult<CourseEditorDto>> {
    const parsed = validateActionInput(AdminCourseBasicsInputSchema, input);
    if (!parsed.ok) return parsed;
    return withAdminAction(async () => {
        try {
            return actionSuccess(await createCourseDraft(toCourseBasicsCommand(parsed.data)), 'Borrador creado.');
        } catch (error) {
            logCourseActionError('course.draft.create.failed', error);
            return actionFailure('UNEXPECTED', 'No fue posible crear el borrador.');
        }
    });
}

export async function updateBasics(input: unknown): Promise<ActionResult<null>> {
    const parsed = validateActionInput(UpdateAdminCourseBasicsInputSchema, input);
    if (!parsed.ok) return parsed;
    return withAdminAction(async () => {
        try {
            await updateCourseBasics(parsed.data.courseId, toCourseBasicsPatchCommand(parsed.data.basics));
            return actionSuccess(null, 'Información básica guardada.');
        } catch (error) {
            logCourseActionError('course.basics.update.failed', error, parsed.data.courseId);
            return actionFailure('UNEXPECTED', 'No fue posible guardar la información básica.');
        }
    });
}

export async function saveContent(input: unknown): Promise<ActionResult<CourseEditorDto>> {
    const parsed = validateActionInput(SaveAdminCourseContentInputSchema, input);
    if (!parsed.ok) return parsed;
    return withAdminAction(async () => {
        try {
            const course = await saveCourseContent(parsed.data.courseId, toCourseContentCommand(parsed.data.content));
            return actionSuccess(course, 'Contenido del curso guardado.');
        } catch (error) {
            logCourseActionError('course.content.save.failed', error, parsed.data.courseId);
            return actionFailure('UNEXPECTED', 'No fue posible guardar el contenido del curso.');
        }
    });
}

export async function queueUnusedAssets(input: unknown): Promise<ActionResult<null>> {
    const parsed = validateActionInput(QueueUnusedCourseAssetsInputSchema, input);
    if (!parsed.ok) return parsed;
    return withAdminAction(async () => {
        try {
            await queueUnusedCourseAssets(parsed.data.courseId, parsed.data.urls);
            return actionSuccess(null);
        } catch (error) {
            logCourseActionError('course.assets.cleanup_queue.failed', error, parsed.data.courseId);
            return actionFailure('UNEXPECTED', 'No fue posible programar la limpieza de archivos.');
        }
    });
}

export async function register(input: unknown): Promise<ActionResult<CourseEditorDto>> {
    const parsedInput = validateActionInput(AdminCourseInputSchema, input);
    if (!parsedInput.ok) return parsedInput;

    return withAdminAction(async () => {
        try {
            const course = await registerCourse(toCreateCourseCommand(parsedInput.data));
            if (!course) {
                safeLogger.error('course.legacy_create.empty_result');
                return actionFailure('UNEXPECTED', 'No se pudo crear el curso.');
            }

            return actionSuccess(course, 'Curso creado correctamente.');
        } catch (error) {
            logCourseActionError('course.legacy_create.failed', error);
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
        } catch (error) {
            logCourseActionError('course.legacy_edit.failed', error, parsedInput.data.courseId);
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
        } catch (error) {
            safeLogger.error('course.class_video.update.failed', {
                classId: parsedInput.data.clsId,
                name: error instanceof Error ? error.name : 'unknown',
            });
            return actionFailure('UNEXPECTED', 'No fue posible modificar la clase.');
        }
    });
}
