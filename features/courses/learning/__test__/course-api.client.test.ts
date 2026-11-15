import { getTopCourses, getUserCourseList } from '@/features/courses/learning/course-api.client';

const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

const enrolledCourse = {
    canonicalId: 'course-1', title: 'Curso', price: 100, courseImage: 'https://example.com/course.jpg',
    instructorName: 'Ada', instructorPhoto: 'https://example.com/ada.jpg', courseDuration: '10 min',
    category: null, description: 'Descripción', expiresAt: '2030-01-01T00:00:00.000Z',
    classViewed: [], moduleViewed: [], classesWithCompletion: [], progressPercent: 0, currentIndex: 0,
    totalClasses: 0, visibleClasses: [],
};

describe('course list HTTP client', () => {
    it('validates catalog and enrolled-course payloads before returning them', async () => {
        const fetcher = jest.fn()
            .mockResolvedValueOnce(response({ data: [{
                id: 1, ...enrolledCourse, alreadyPurchased: false,
            }] }))
            .mockResolvedValueOnce(response({ data: [enrolledCourse] }));

        await expect(getTopCourses(fetcher)).resolves.toHaveLength(1);
        await expect(getUserCourseList(fetcher)).resolves.toEqual([enrolledCourse]);
    });

    it('rejects malformed JSON payloads and failed HTTP responses', async () => {
        const malformed = jest.fn().mockResolvedValue(response({ data: [{ canonicalId: 'course-1' }] }));
        const failed = jest.fn().mockResolvedValue(response({ error: { code: 'UNAUTHENTICATED', message: 'Inicia sesión' } }, 401));

        await expect(getUserCourseList(malformed)).rejects.toThrow();
        await expect(getTopCourses(failed)).rejects.toThrow('Inicia sesión');
    });

    it('accepts an empty list but rejects raw and contradictory envelopes', async () => {
        await expect(getUserCourseList(jest.fn().mockResolvedValue(response({ data: [] })))).resolves.toEqual([]);
        await expect(getUserCourseList(jest.fn().mockResolvedValue(response([enrolledCourse])))).rejects.toThrow('formato inválido');
        await expect(getUserCourseList(jest.fn().mockResolvedValue(response({
            data: [enrolledCourse], error: { code: 'UNEXPECTED', message: 'Conflicto' },
        })))).rejects.toThrow('formato inválido');
    });

    it('uses a safe fallback when an HTTP error does not match the public contract', async () => {
        const failed = jest.fn().mockResolvedValue(response({ error: { code: 'PRIVATE_CODE', message: 'No exponer' } }, 500));

        await expect(getTopCourses(failed)).rejects.toThrow('No fue posible completar la solicitud');
    });
});
