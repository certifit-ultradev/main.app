import {
    QuizHttpError,
    calculateQuizAttempt,
    loadLastQuizAttempt,
    loadQuizAnswers,
    saveQuizAnswer,
} from '@/components/course/client/quiz-http-client';

const jsonResponse = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe('quiz HTTP client', () => {
    it('sends only the selected-option variant when saving a multiple-choice answer', async () => {
        const fetcher = jest.fn().mockResolvedValue(jsonResponse({ data: { saved: true } }));

        await saveQuizAnswer({
            canonicalId: 'course-1', moduleId: 1, quizId: 2, questionId: 3, kind: 'multiple_choice', optionId: 4,
        }, fetcher);

        expect(fetcher).toHaveBeenCalledWith('/api/courses/quiz-answer', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
                canonicalId: 'course-1', moduleId: 1, quizId: 2, questionId: 3, kind: 'multiple_choice', optionId: 4,
            }),
        }));
    });

    it('rejects a response that is not a successful answer persistence', async () => {
        const fetcher = jest.fn().mockResolvedValue(jsonResponse({ data: { saved: false } }));

        await expect(saveQuizAnswer({
            canonicalId: 'course-1', moduleId: 1, quizId: 2, questionId: 3, kind: 'text', answer: 'Respuesta',
        }, fetcher)).rejects.toBeInstanceOf(QuizHttpError);
    });

    it('validates stored answers and a persisted score returned by the API', async () => {
        const fetcher = jest.fn()
            .mockResolvedValueOnce(jsonResponse({ data: [{ questionId: 3, answer: 'Respuesta' }] }))
            .mockResolvedValueOnce(jsonResponse({ data: { questionCount: 1, totalScore: 10, pass: true } }));

        await expect(loadQuizAnswers('course-1', 2, fetcher)).resolves.toEqual([{ questionId: 3, answer: 'Respuesta' }]);
        await expect(calculateQuizAttempt({ canonicalId: 'course-1', moduleId: 1, quizId: 2 }, fetcher))
            .resolves.toEqual({ questionCount: 1, totalScore: 10, pass: true });
    });

    it('treats a missing prior attempt as an ordinary empty state', async () => {
        const fetcher = jest.fn().mockResolvedValue(jsonResponse({ error: { code: 'NOT_FOUND', message: 'No hay intento' } }, 404));

        await expect(loadLastQuizAttempt('course-1', 2, fetcher)).resolves.toBeNull();
    });

    it('validates saved-attempt data inside a successful HTTP envelope', async () => {
        const attempt = { quizId: 2, courseModuleId: 1, retries: 1, result: 10, passed: true };
        const fetcher = jest.fn().mockResolvedValue(jsonResponse({ data: attempt }));

        await expect(loadLastQuizAttempt('course-1', 2, fetcher)).resolves.toEqual(attempt);
    });

    it('rejects raw, malformed and contradictory read responses', async () => {
        const raw = jest.fn().mockResolvedValue(jsonResponse([{ questionId: 3, answer: 'Respuesta' }]));
        const malformed = jest.fn().mockResolvedValue(jsonResponse({ data: [{ questionId: '3', answer: 'Respuesta' }] }));
        const contradictory = jest.fn().mockResolvedValue(jsonResponse({
            data: [], error: { code: 'UNEXPECTED', message: 'Conflicto' },
        }));

        await expect(loadQuizAnswers('course-1', 2, raw)).rejects.toMatchObject({ status: 502 });
        await expect(loadQuizAnswers('course-1', 2, malformed)).rejects.toMatchObject({ status: 502 });
        await expect(loadQuizAnswers('course-1', 2, contradictory)).rejects.toMatchObject({ status: 502 });
    });

    it('uses a generic message for a malformed HTTP error in a quiz read', async () => {
        const fetcher = jest.fn().mockResolvedValue(jsonResponse({ error: { message: 'Interno' } }, 403));

        await expect(loadQuizAnswers('course-1', 2, fetcher))
            .rejects.toEqual(new QuizHttpError('No fue posible completar la operación del quiz.', 403));
    });

    it('rejects raw or contradictory write responses', async () => {
        const command = { canonicalId: 'course-1', moduleId: 1, quizId: 2, questionId: 3, kind: 'text' as const, answer: 'Respuesta' };
        const raw = jest.fn().mockResolvedValue(jsonResponse({ success: true }));
        const contradictory = jest.fn().mockResolvedValue(jsonResponse({
            data: { saved: true }, error: { code: 'UNEXPECTED', message: 'Conflicto' },
        }));

        await expect(saveQuizAnswer(command, raw)).rejects.toMatchObject({ status: 502 });
        await expect(saveQuizAnswer(command, contradictory)).rejects.toMatchObject({ status: 502 });
    });

    it('rejects malformed scores and public HTTP errors without a structural guard', async () => {
        const command = { canonicalId: 'course-1', moduleId: 1, quizId: 2 };
        const malformed = jest.fn().mockResolvedValue(jsonResponse({ data: { questionCount: '1', totalScore: 10, pass: true } }));
        const failed = jest.fn().mockResolvedValue(jsonResponse({ error: { code: 'FORBIDDEN', message: 'Sin acceso.' } }, 403));

        await expect(calculateQuizAttempt(command, malformed)).rejects.toMatchObject({ status: 502 });
        await expect(calculateQuizAttempt(command, failed)).rejects.toEqual(new QuizHttpError('Sin acceso.', 403));
    });

    it('rejects non-JSON write responses before treating an answer as saved', async () => {
        const fetcher = jest.fn().mockResolvedValue(new Response('{', { status: 200 }));

        await expect(saveQuizAnswer({
            canonicalId: 'course-1', moduleId: 1, quizId: 2, questionId: 3, kind: 'text', answer: 'Respuesta',
        }, fetcher)).rejects.toMatchObject({ status: 502 });
    });
});
