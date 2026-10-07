import { NextRequest } from 'next/server';
import { NotFoundError } from '@/exceptions/not-found';
import { getUserQuizState } from '@/services/courses';
import { GET } from '@/src/app/api/courses/[canonicalId]/quizzes/[quizId]/last-result/route';

jest.mock('@/services/courses', () => ({ getUserQuizState: jest.fn() }));

const request = () => new NextRequest('http://localhost/api/courses/course-1/quizzes/2/last-result');
const context = { params: Promise.resolve({ canonicalId: 'course-1', quizId: '2' }) };

describe('GET /api/courses/[canonicalId]/quizzes/[quizId]/last-result', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns a public attempt result without the enrollment id', async () => {
        (getUserQuizState as jest.Mock).mockResolvedValue({
            userCourseId: 99, quizId: 2, courseModuleId: 1, retries: 1, result: 10, passed: true,
        });

        await expect((await GET(request(), context)).json()).resolves.toEqual({
            data: { quizId: 2, courseModuleId: 1, retries: 1, result: 10, passed: true },
        });
    });

    it('returns 404 when there is no persisted attempt yet', async () => {
        (getUserQuizState as jest.Mock).mockRejectedValue(new NotFoundError('Estado no encontrado'));

        const response = await GET(request(), context);
        expect(response.status).toBe(404);
        await expect(response.json()).resolves.toMatchObject({ error: { code: 'NOT_FOUND' } });
    });
});
