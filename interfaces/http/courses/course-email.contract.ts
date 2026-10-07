import { z } from 'zod';

const canonicalId = z.string().trim().min(1).max(120);

export const CourseEmailParamsSchema = z.object({ canonicalId });

export const CourseInformationRequestSchema = z.object({
    nombre: z.string().trim().min(1).max(160),
    empresa: z.string().trim().min(1).max(160),
    email: z.string().trim().email().max(320),
    telefono: z.string().trim().min(1).max(50),
    curso: z.string().trim().min(1).max(200),
    detalles: z.string().trim().min(1).max(10_000),
    terminos: z.literal(true),
});

export const CourseInformationSentResponseSchema = z.object({
    message: z.string().min(1),
}).strict();

export type CourseInformationRequest = z.infer<typeof CourseInformationRequestSchema>;
export type CourseInformationRequestCommand = CourseInformationRequest & { canonicalId: string };
export type CourseInformationSentResponse = z.infer<typeof CourseInformationSentResponseSchema>;

export type CourseEmailRouteContext = {
    params: Promise<{ canonicalId: string }>;
};
