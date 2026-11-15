'use server';

import { getAllCourseCategories, getCategoryById } from '@/services/categories';
import { actionFailure, actionSuccess, type ActionResult } from '@/interfaces/actions/action-result';
import { withAdminAction } from '@/interfaces/actions/action-context';
import type { CategoryDto } from '@/interfaces/actions/categories/category.contract';
import { DeleteCategoryInputSchema } from '@/interfaces/actions/categories/category.contract';
import { validateActionInput } from '@/interfaces/actions/validation';
import { safeLogger } from '@/shared/observability/safe-logger';

function unexpectedCategoryError(): ActionResult<never> {
    return actionFailure('UNEXPECTED', 'No fue posible completar la operación de categorías.');
}

export async function listAllCourseCategories(): Promise<ActionResult<CategoryDto[]>> {
    return withAdminAction(async () => {
        try {
            const categories = await getAllCourseCategories();
            return actionSuccess(categories);
        } catch {
            safeLogger.error('action.category.list.failed');
            return unexpectedCategoryError();
        }
    });
}

export async function fetchCategoryById(
    input: unknown,
): Promise<ActionResult<CategoryDto>> {
    const parsedInput = validateActionInput(DeleteCategoryInputSchema, input);
    if (!parsedInput.ok) return parsedInput;

    return withAdminAction(async () => {
        try {
            const category = await getCategoryById(parsedInput.data.id);
            if (!category) {
                return actionFailure('NOT_FOUND', 'La categoría no existe.');
            }
            return actionSuccess(category);
        } catch {
            safeLogger.error('action.category.get_by_id.failed');
            return unexpectedCategoryError();
        }
    });
}
