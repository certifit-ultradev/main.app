import { NextRequest } from 'next/server';
import { CourseNotPurchasedError } from '@/exceptions/course-not-purchased';
import { registerQuestionAnswer } from '@/services/courses';
import { POST } from '@/src/app/api/courses/quiz-answer/route';

jest.mock('@/services/courses', () => ({ registerQuestionAnswer: jest.fn() }));
jest.mock('@/shared/observability/safe-logger', () => ({ safeLogger: { error: jest.fn() } }));

const validAnswer = {
    canonicalId: 'course-1', moduleId: 1, quizId: 2, questionId: 3, kind: 'text', answer: 'Respuesta',
};

describe('POST /api/courses/quiz-answer', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns 400 for malformed JSON before invoking the service', async () => {
        const request = new NextRequest('http://localhost/api/courses/quiz-answer', { method: 'POST', body: '{' });

        expect((await POST(request)).status).toBe(400);
        expect(registerQuestionAnswer).not.toHaveBeenCalled();
    });

    it('returns 422 for syntactically valid but invalid data', async () => {
        const request = new NextRequest('http://localhost/api/courses/quiz-answer', {
            method: 'POST', body: JSON.stringify({ ...validAnswer, answer: '' }),
        });

        expect((await POST(request)).status).toBe(422);
        expect(registerQuestionAnswer).not.toHaveBeenCalled();
    });

    it('returns 403 when the course enrollment does not allow the answer', async () => {
        (registerQuestionAnswer as jest.Mock).mockRejectedValue(new CourseNotPurchasedError('El curso no pertenece al usuario'));
        const request = new NextRequest('http://localhost/api/courses/quiz-answer', {
            method: 'POST', body: JSON.stringify(validAnswer),
        });

        expect((await POST(request)).status).toBe(403);
    });

    it('returns a minimal saved acknowledgement without scoring details', async () => {
        (registerQuestionAnswer as jest.Mock).mockResolvedValue({ success: true, points: 10, correct: 'Secret' });
        const request = new NextRequest('http://localhost/api/courses/quiz-answer', {
            method: 'POST', body: JSON.stringify(validAnswer),
        });

        const response = await POST(request);
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ data: { saved: true } });
    });

    it('does not acknowledge an unsuccessful service result', async () => {
        (registerQuestionAnswer as jest.Mock).mockResolvedValue({ success: false });
        const request = new NextRequest('http://localhost/api/courses/quiz-answer', {
            method: 'POST', body: JSON.stringify(validAnswer),
        });

        const response = await POST(request);
        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toMatchObject({ error: { code: 'UNEXPECTED' } });
    });
});
