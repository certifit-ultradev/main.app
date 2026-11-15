import { z } from 'zod';

export const CourseParamsSchema = z.object({
    canonicalId: z.string().min(1).max(120),
});

export const CourseQuizParamsSchema = CourseParamsSchema.extend({
    quizId: z.coerce.number().int().positive(),
});

export type CourseRouteContext = {
    params: Promise<{ canonicalId: string }>;
};

export type CourseQuizRouteContext = {
    params: Promise<{ canonicalId: string; quizId: string }>;
};
