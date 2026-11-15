import { z } from 'zod';

export const CreateCategorySchema = z.object({ name: z.string().min(3, { message: 'El nombre es requerido' }) });
export const EditCategorySchema = z.object({ name: z.string().optional() });
