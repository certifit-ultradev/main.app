import { NextRequest } from 'next/server';
import { calculateQuizScore } from '@/services/courses';
import { POST } from '@/src/app/api/courses/calculate-quiz-score/route';

jest.mock('@/services/courses', () => ({ calculateQuizScore: jest.fn() }));

describe('POST /api/courses/calculate-quiz-score', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns 422 for an invalid score command', async () => {
        const request = new NextRequest('http://localhost/api/courses/calculate-quiz-score', {
            method: 'POST', body: JSON.stringify({ canonicalId: 'course-1', moduleId: 0, quizId: 2 }),
        });

        expect((await POST(request)).status).toBe(422);
        expect(calculateQuizScore).not.toHaveBeenCalled();
    });

    it('returns 404 instead of serializing a null result', async () => {
        (calculateQuizScore as jest.Mock).mockResolvedValue(null);
        const request = new NextRequest('http://localhost/api/courses/calculate-quiz-score', {
            method: 'POST', body: JSON.stringify({ canonicalId: 'course-1', moduleId: 1, quizId: 2 }),
        });

        const response = await POST(request);
        expect(response.status).toBe(404);
        await expect(response.json()).resolves.toMatchObject({ error: { code: 'NOT_FOUND' } });
    });

    it('wraps the calculated result without exposing persistence details', async () => {
        (calculateQuizScore as jest.Mock).mockResolvedValue({ questionCount: 2, totalScore: 10, pass: true, userCourseId: 99 });
        const request = new NextRequest('http://localhost/api/courses/calculate-quiz-score', {
            method: 'POST', body: JSON.stringify({ canonicalId: 'course-1', moduleId: 1, quizId: 2 }),
        });

        const response = await POST(request);
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ data: { questionCount: 2, totalScore: 10, pass: true } });
    });
});
