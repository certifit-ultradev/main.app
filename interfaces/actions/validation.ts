import type { z } from 'zod';
import { actionFailure, type ActionFailure } from './action-result';

/** Parses an untrusted action argument and exposes serializable field errors. */
export function validateActionInput<T>(
    schema: z.ZodType<T>,
    input: unknown,
): { ok: true; data: T } | ActionFailure {
    const parsed = schema.safeParse(input);
    if (parsed.success) {
        return { ok: true, data: parsed.data };
    }

    const fieldErrors: Record<string, string[]> = {};
    for (const [field, messages] of Object.entries(parsed.error.flatten().fieldErrors)) {
        if (Array.isArray(messages)) {
            fieldErrors[field] = messages.filter((message): message is string => typeof message === 'string');
        }
    }

    return actionFailure('VALIDATION', 'Los datos enviados no son válidos.', fieldErrors);
}
