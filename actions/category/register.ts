'use server';

import { changeCourseCategory, registerCourseCategory, removeCourseCategory } from '@/services/categories';
import { actionFailure, actionSuccess, type ActionResult } from '@/interfaces/actions/action-result';
import { withAdminAction } from '@/interfaces/actions/action-context';
import {
    CreateCategoryInputSchema,
    DeleteCategoryInputSchema,
    UpdateCategoryInputSchema,
} from '@/interfaces/actions/categories/category.contract';
import { validateActionInput } from '@/interfaces/actions/validation';

function unexpectedCategoryError(): ActionResult<never> {
    return actionFailure('UNEXPECTED', 'No fue posible completar la operación de categorías.');
}

export async function register(input: unknown): Promise<ActionResult<null>> {
    const parsedInput = validateActionInput(CreateCategoryInputSchema, input);
    if (!parsedInput.ok) return parsedInput;

    return withAdminAction(async () => {
        try {
            const category = await registerCourseCategory(parsedInput.data);
            if (!category) {
                return actionFailure('UNEXPECTED', 'No se pudo crear la categoría.');
            }
            return actionSuccess(null, 'Categoría creada correctamente.');
        } catch {
            return unexpectedCategoryError();
        }
    });
}

export async function edit(input: unknown): Promise<ActionResult<null>> {
    const parsedInput = validateActionInput(UpdateCategoryInputSchema, input);
    if (!parsedInput.ok) return parsedInput;

    return withAdminAction(async () => {
        try {
            const category = await changeCourseCategory(parsedInput.data);
            if (!category) {
                return actionFailure('NOT_FOUND', 'La categoría no existe.');
            }
            return actionSuccess(null, 'Categoría editada correctamente.');
        } catch {
            return unexpectedCategoryError();
        }
    });
}

export async function deleteCategory(input: unknown): Promise<ActionResult<null>> {
    const parsedInput = validateActionInput(DeleteCategoryInputSchema, input);
    if (!parsedInput.ok) return parsedInput;

    return withAdminAction(async () => {
        try {
            await removeCourseCategory(parsedInput.data.id);
            return actionSuccess(null, 'Categoría eliminada correctamente.');
        } catch {
            return unexpectedCategoryError();
        }
    });
}
