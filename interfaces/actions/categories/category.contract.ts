import type { CategoryRecord } from '@/application/categories/category.records';

/** Serializable category data exposed by administrative server actions. */
export type CategoryDto = CategoryRecord;

/** Input shapes are intentionally distinct from the persistence entity. */
export type CreateCategoryInput = {
    name: string;
};

export type UpdateCategoryInput = {
    id: number;
    name: string;
};

export type DeleteCategoryInput = {
    id: number;
};

export const CreateCategoryInputSchema = z.object({
    name: z.string().trim().min(3, 'El nombre es requerido.'),
}).strict();

export const UpdateCategoryInputSchema = CreateCategoryInputSchema.extend({
    id: z.number().int().positive(),
}).strict();

export const DeleteCategoryInputSchema = z.object({
    id: z.number().int().positive(),
}).strict();
import { z } from 'zod';
