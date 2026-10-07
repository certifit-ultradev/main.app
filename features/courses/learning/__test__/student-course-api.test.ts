import { parseStudentCourseResponse, StudentCourseHttpError } from '@/features/courses/learning/student-course-api';

const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

const course = {
    canonicalId: 'course-1', title: 'Curso', description: 'Descripción', courseImage: 'course.png',
    instructorName: 'Ada', instructorPhoto: 'ada.png', expiresAt: '2030-01-01T00:00:00.000Z',
    category: null, price: 100, modules: [], moduleCompleted: [], classCompleted: [], quizCompleted: [],
};

describe('student course HTTP parser', () => {
    it('returns only a validated student-course DTO', async () => {
        await expect(parseStudentCourseResponse(response({ data: course }))).resolves.toEqual(course);
    });

    it('keeps the endpoint status for expected HTTP errors', async () => {
        await expect(parseStudentCourseResponse(response({ error: { code: 'UNAUTHENTICATED', message: 'Debes iniciar sesión' } }, 401)))
            .rejects.toMatchObject({ name: 'StudentCourseHttpError', status: 401 });
        await expect(parseStudentCourseResponse(response({ error: { code: 'FORBIDDEN', message: 'Sin acceso' } }, 403)))
            .rejects.toMatchObject({ name: 'StudentCourseHttpError', status: 403 });
        await expect(parseStudentCourseResponse(response({ error: { code: 'NOT_FOUND', message: 'No existe' } }, 404)))
            .rejects.toMatchObject({ name: 'StudentCourseHttpError', status: 404 });
    });

    it('preserves HTTP status but hides malformed error payloads', async () => {
        await expect(parseStudentCourseResponse(response({ success: false, message: 'Mensaje interno' }, 403)))
            .rejects.toEqual(new StudentCourseHttpError(403, 'No fue posible cargar el curso'));
    });

    it('rejects a malformed successful payload with a boundary error', async () => {
        await expect(parseStudentCourseResponse(response({ data: { canonicalId: 'course-1' } })))
            .rejects.toEqual(new StudentCourseHttpError(502, 'El servidor devolvió un curso con un formato inválido'));
    });

    it('rejects a raw course or simultaneous data and error', async () => {
        await expect(parseStudentCourseResponse(response(course))).rejects.toMatchObject({ status: 502 });
        await expect(parseStudentCourseResponse(response({
            data: course, error: { code: 'UNEXPECTED', message: 'Contradictorio' },
        }))).rejects.toMatchObject({ status: 502 });
    });

    it('rejects a text question carrying options or a solution', async () => {
        const withLeakedAnswer = {
            ...course,
            modules: [{
                id: 1, courseId: 1, title: 'Módulo', minRequiredPoints: 1, classes: [],
                quiz: { id: 2, courseModuleId: 1, title: 'Quiz', description: '', questions: [
                    { id: 3, type: 'text', title: 'Pregunta', options: [{ id: 4, value: 'Secreto' }] },
                ] },
            }],
        };
        await expect(parseStudentCourseResponse(response({ data: withLeakedAnswer })))
            .rejects.toMatchObject({ status: 502 });
    });
});
