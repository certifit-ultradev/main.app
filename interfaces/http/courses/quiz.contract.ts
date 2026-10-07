import { z } from 'zod';

const positiveId = z.number().int().positive();

const submitQuizAnswerBase = z.object({
    canonicalId: z.string().min(1).max(120),
    moduleId: positiveId,
    quizId: positiveId,
    questionId: positiveId,
});

export const SubmitQuizAnswerRequestSchema = z.discriminatedUnion('kind', [
    submitQuizAnswerBase.extend({
        kind: z.literal('text'),
        answer: z.string().trim().min(1).max(10_000),
    }).strict(),
    submitQuizAnswerBase.extend({
        kind: z.literal('multiple_choice'),
        optionId: positiveId,
    }).strict(),
]);

export type SubmitQuizAnswerRequest = z.infer<typeof SubmitQuizAnswerRequestSchema>;

/** HTTP acknowledgement emitted only after an answer was persisted. */
export const QuizAnswerSavedResponseSchema = z.object({ saved: z.literal(true) }).strict();

export const CalculateQuizScoreRequestSchema = z.object({
    canonicalId: z.string().min(1).max(120),
    moduleId: positiveId,
    quizId: positiveId,
});
export type CalculateQuizScoreRequest = z.infer<typeof CalculateQuizScoreRequestSchema>;

export const QuizStoredAnswerResponseSchema = z.object({
    questionId: positiveId,
    answer: z.string(),
});
export type QuizStoredAnswerResponse = z.infer<typeof QuizStoredAnswerResponseSchema>;

export const QuizAttemptResultResponseSchema = z.object({
    questionCount: z.number().int().nonnegative(),
    totalScore: z.number().finite().nonnegative(),
    pass: z.boolean(),
});
export type QuizAttemptResultResponse = z.infer<typeof QuizAttemptResultResponseSchema>;

export const LastQuizAttemptResponseSchema = z.object({
    quizId: positiveId,
    courseModuleId: positiveId,
    retries: z.number().int().nonnegative(),
    result: z.number().finite().nonnegative(),
    passed: z.boolean(),
});
export type LastQuizAttemptResponse = z.infer<typeof LastQuizAttemptResponseSchema>;
