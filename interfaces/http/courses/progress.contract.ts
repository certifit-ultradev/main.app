import { z } from 'zod';

const positiveId = z.number().int().positive();
const canonicalId = z.string().min(1).max(120);

export const RecordClassProgressRequestSchema = z.object({
    canonicalId,
    classId: positiveId,
    isCompleted: z.boolean(),
    currentTime: z.number().finite().min(0),
});
export type RecordClassProgressRequest = z.infer<typeof RecordClassProgressRequestSchema>;

export const CompleteModuleRequestSchema = z.object({
    canonicalId,
    moduleId: positiveId,
});
export type CompleteModuleRequest = z.infer<typeof CompleteModuleRequestSchema>;

/** HTTP acknowledgement emitted only after progress was persisted. */
export const ProgressSavedResponseSchema = z.object({ saved: z.literal(true) }).strict();
