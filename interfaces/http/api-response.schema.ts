import { z } from 'zod';
import { API_ERROR_CODES } from './api-response';

/** Validates the outer HTTP contract without accepting both response variants. */
export const apiSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    z.object({ data: dataSchema }).strict();

export const ApiFailureSchema = z.object({
    error: z.object({
        code: z.enum(API_ERROR_CODES),
        message: z.string(),
        fieldErrors: z.record(z.array(z.string())).optional(),
    }).strict(),
}).strict();
