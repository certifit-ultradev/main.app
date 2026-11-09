import { z } from 'zod';
import type { StudentCourseDto } from '@/application/courses/student-course.dto';
import { ApiFailureSchema, apiSuccessSchema } from '@/interfaces/http/api-response.schema';

const StudentCourseSchema: z.ZodType<StudentCourseDto> = z.object({
    canonicalId: z.string().min(1),
    title: z.string(),
    description: z.string(),
    courseImage: z.string(),
    instructorName: z.string(),
    instructorPhoto: z.string(),
    expiresAt: z.string().datetime(),
    category: z.object({ id: z.number().int().positive(), name: z.string() }).nullable(),
    price: z.number().finite(),
    modules: z.array(z.object({
        id: z.number().int().positive(),
        courseId: z.number().int().positive(),
        title: z.string(),
        minRequiredPoints: z.number().finite(),
        locked: z.boolean(),
        classes: z.array(z.object({
            id: z.number().int().positive(),
            courseModuleId: z.number().int().positive(),
            title: z.string(),
            description: z.string(),
            video: z.string().nullable(),
            videoSize: z.number().finite().nullable(),
            videoDuration: z.number().finite().nullable(),
        })),
        quiz: z.object({
            id: z.number().int().positive(),
            courseModuleId: z.number().int().positive(),
            title: z.string(),
            description: z.string(),
            questions: z.array(z.discriminatedUnion('type', [
                z.object({
                    id: z.number().int().positive(),
                    type: z.literal('text'),
                    title: z.string(),
                }).strict(),
                z.object({
                    id: z.number().int().positive(),
                    type: z.literal('multiple'),
                    title: z.string(),
                    options: z.array(z.object({ id: z.number().int().positive(), value: z.string() })).min(2),
                }).strict(),
            ])),
        }).nullable(),
    })),
    moduleCompleted: z.array(z.object({
        moduleId: z.number().int().positive(),
        isCompleted: z.boolean(),
        createdAt: z.string().datetime(),
    })),
    classCompleted: z.array(z.object({
        classId: z.number().int().positive(),
        currentVideoTime: z.number().finite(),
        isCompleted: z.boolean(),
        createdAt: z.string().datetime(),
        lastViewedAt: z.string().datetime(),
    })),
    quizCompleted: z.array(z.object({
        quizId: z.number().int().positive(),
        courseModuleId: z.number().int().positive(),
        result: z.number().finite(),
        retries: z.number().int().nonnegative(),
        passed: z.boolean(),
        createdAt: z.string().datetime(),
        lastAttemptAt: z.string().datetime(),
    })),
});

/** HTTP failure returned by the enrolled-course endpoint. Its message is safe for logs only. */
export class StudentCourseHttpError extends Error {
    constructor(readonly status: number, message = 'No fue posible cargar el curso') {
        super(message);
        this.name = 'StudentCourseHttpError';
    }
}

function getErrorMessage(payload: unknown): string {
    const parsed = ApiFailureSchema.safeParse(payload);
    return parsed.success
        ? parsed.data.error.message
        : 'No fue posible cargar el curso';
}

/**
 * Validates the response envelope and DTO from GET /api/courses/[canonicalId].
 * The course page must never pass an unvalidated API value to a client component.
 */
export async function parseStudentCourseResponse(response: Response): Promise<StudentCourseDto> {
    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
        throw new StudentCourseHttpError(response.status, getErrorMessage(payload));
    }

    const parsed = apiSuccessSchema(StudentCourseSchema).safeParse(payload);
    if (!parsed.success) {
        throw new StudentCourseHttpError(502, 'El servidor devolvió un curso con un formato inválido');
    }

    return parsed.data.data;
}
