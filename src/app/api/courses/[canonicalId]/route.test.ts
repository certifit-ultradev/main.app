import { NextRequest } from 'next/server';
import { UserNotLoggedError } from '@/exceptions/user-not-logged';
import { EmailUnverifiedError, InsufficientRoleError } from '@/exceptions/actor-access-errors';
import { getStudentCourseByCanonicalId } from '@/services/courses';
import { GET } from '@/src/app/api/courses/[canonicalId]/route';

jest.mock('@/services/courses', () => ({ getStudentCourseByCanonicalId: jest.fn() }));

const request = () => new NextRequest('http://localhost/api/courses/course-1');
const context = { params: Promise.resolve({ canonicalId: 'course-1' }) };

describe('GET /api/courses/[canonicalId]', () => {
    beforeEach(() => jest.clearAllMocks());

    it('serializes only the student quiz contract', async () => {
        (getStudentCourseByCanonicalId as jest.Mock).mockResolvedValue({
            canonicalId: 'course-1',
            title: 'Curso',
            description: 'Descripción',
            courseImage: 'course.png',
            instructorName: 'Ada',
            instructorPhoto: 'ada.png',
            expiresAt: '2030-01-01T00:00:00.000Z',
            category: null,
            price: 100,
            modules: [{
                id: 1,
                courseId: 1,
                title: 'Módulo',
                minRequiredPoints: 5,
                classes: [],
                quiz: {
                    id: 2,
                    courseModuleId: 1,
                    title: 'Quiz',
                    description: 'Evaluación',
                    questions: [{ id: 3, type: 'multiple', title: 'Pregunta', options: [{ id: 4, value: 'Opción' }] }],
                },
            }],
            moduleCompleted: [],
            classCompleted: [],
            quizCompleted: [],
        });

        const response = await GET(request(), context);
        const body = await response.json();
        const serialized = JSON.stringify(body);

        expect(response.status).toBe(200);
        expect(body).toHaveProperty('data.canonicalId', 'course-1');
        expect(body).not.toHaveProperty('error');
        expect(serialized).not.toMatch(/"(?:isCorrect|correct|expectedAnswer|points)"/);
    });

    it('returns 422 for invalid route parameters', async () => {
        const response = await GET(request(), { params: Promise.resolve({ canonicalId: '' }) });

        expect(response.status).toBe(422);
        expect(getStudentCourseByCanonicalId).not.toHaveBeenCalled();
    });

    it('returns 404 when the enrolled course does not exist', async () => {
        (getStudentCourseByCanonicalId as jest.Mock).mockResolvedValue(null);

        const response = await GET(request(), context);
        expect(response.status).toBe(404);
        await expect(response.json()).resolves.toMatchObject({ error: { code: 'NOT_FOUND' } });
    });

    it.each([
        [new UserNotLoggedError('private@example.com'), 401, 'UNAUTHENTICATED'],
        [new EmailUnverifiedError(), 403, 'EMAIL_UNVERIFIED'],
        [new InsufficientRoleError(), 403, 'FORBIDDEN'],
    ] as const)('encodes actor rejection %# without private data', async (error, status, code) => {
        (getStudentCourseByCanonicalId as jest.Mock).mockRejectedValue(error);

        const response = await GET(request(), context);
        const body = await response.json();
        expect(response.status).toBe(status);
        expect(body).toMatchObject({ error: { code } });
        expect(JSON.stringify(body)).not.toContain('private@example.com');
    });
});
