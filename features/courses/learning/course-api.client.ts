import { z } from 'zod';
import type { CatalogCourseCardDto } from '@/application/courses/course.dto';
import type { StudentCourseListItemDto } from '@/application/courses/student-course.dto';
import { ApiFailureSchema, apiSuccessSchema } from '@/interfaces/http/api-response.schema';

const CatalogCourseCardSchema = z.object({
    id: z.number().int().positive(),
    canonicalId: z.string(),
    title: z.string(),
    description: z.string(),
    price: z.number(),
    courseImage: z.string(),
    courseDuration: z.string(),
    instructorName: z.string(),
    instructorPhoto: z.string(),
    category: z.object({ id: z.number().int().positive(), name: z.string() }).nullable(),
    expiresAt: z.string().datetime(),
    alreadyPurchased: z.boolean(),
});

const StudentCourseListItemSchema = z.object({
    canonicalId: z.string().min(1), title: z.string(), price: z.number().finite(), courseImage: z.string(),
    instructorName: z.string(), instructorPhoto: z.string(), courseDuration: z.string(),
    category: z.object({ id: z.number().int().positive(), name: z.string() }).nullable(), description: z.string(),
    expiresAt: z.string(), classViewed: z.array(z.object({ classId: z.number().int().positive(), currentVideoTime: z.number().finite(), completed: z.boolean() })),
    moduleViewed: z.array(z.object({ moduleId: z.number().int().positive(), completed: z.boolean() })),
    classesWithCompletion: z.array(z.object({ id: z.number().int().positive(), title: z.string(), completed: z.boolean() })),
    progressPercent: z.number().finite(), currentIndex: z.number().int().nonnegative(), totalClasses: z.number().int().nonnegative(),
    visibleClasses: z.array(z.object({ id: z.number().int().positive(), title: z.string(), completed: z.boolean() })),
});

async function parseResponse<T>(response: Response, schema: z.ZodType<T>): Promise<T> {
    const json: unknown = await response.json().catch(() => null);
    if (!response.ok) {
        const parsedError = ApiFailureSchema.safeParse(json);
        throw new Error(parsedError.success ? parsedError.data.error.message : 'No fue posible completar la solicitud');
    }

    const envelope = apiSuccessSchema(z.unknown()).safeParse(json);
    if (!envelope.success) throw new Error('El servidor devolvió una lista de cursos con un formato inválido.');
    return schema.parse(envelope.data.data);
}

export async function getTopCourses(fetcher: typeof fetch = fetch): Promise<CatalogCourseCardDto[]> {
    return parseResponse(await fetcher('/api/courses/top-three'), z.array(CatalogCourseCardSchema));
}

export async function getUserCourseList(fetcher: typeof fetch = fetch): Promise<StudentCourseListItemDto[]> {
    return parseResponse(await fetcher('/api/courses'), z.array(StudentCourseListItemSchema));
}
