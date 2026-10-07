import { NextRequest } from 'next/server';
import { getUserCourseQuizAnswers } from '@/services/courses';
import { GET } from '@/src/app/api/courses/[canonicalId]/quizzes/[quizId]/route';

jest.mock('@/services/courses', () => ({ getUserCourseQuizAnswers: jest.fn() }));

const request = () => new NextRequest('http://localhost/api/courses/course-1/quizzes/2');

describe('GET /api/courses/[canonicalId]/quizzes/[quizId]', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns 422 before the service for invalid path params', async () => {
        const response = await GET(request(), { params: Promise.resolve({ canonicalId: 'course-1', quizId: 'invalid' }) });

        expect(response.status).toBe(422);
        expect(getUserCourseQuizAnswers).not.toHaveBeenCalled();
    });

    it('does not expose enrollment or quiz persistence identifiers', async () => {
        (getUserCourseQuizAnswers as jest.Mock).mockResolvedValue([
            { userCourseId: 99, quizId: 2, questionId: 3, answer: 'Respuesta' },
        ]);

        const response = await GET(request(), { params: Promise.resolve({ canonicalId: 'course-1', quizId: '2' }) });

        await expect(response.json()).resolves.toEqual({ data: [{ questionId: 3, answer: 'Respuesta' }] });
    });

    it('returns an empty saved-answer collection when no answers exist', async () => {
        (getUserCourseQuizAnswers as jest.Mock).mockResolvedValue([]);

        const response = await GET(request(), { params: Promise.resolve({ canonicalId: 'course-1', quizId: '2' }) });
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ data: [] });
    });
});
