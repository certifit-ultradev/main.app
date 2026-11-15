import { SubmitQuizAnswerRequestSchema } from '@/interfaces/http/courses/quiz.contract';

describe('SubmitQuizAnswerRequestSchema', () => {
    it.each([
        [{ canonicalId: 'course', moduleId: 1, quizId: 2, questionId: 3, kind: 'text', answer: 'Respuesta' }],
        [{ canonicalId: 'course', moduleId: 1, quizId: 2, questionId: 3, kind: 'multiple_choice', optionId: 4 }],
    ])('accepts a valid answer command: %o', (input) => {
        expect(SubmitQuizAnswerRequestSchema.safeParse(input).success).toBe(true);
    });

    it.each([
        { canonicalId: 'course', moduleId: 1, quizId: 2, questionId: 3, kind: 'text', optionId: 4 },
        { canonicalId: 'course', moduleId: 1, quizId: 2, questionId: 3, kind: 'multiple_choice', answer: 'Respuesta' },
        { canonicalId: 'course', moduleId: 1, quizId: 2, questionId: 3, kind: 'text', answer: '' },
        { canonicalId: 'course', moduleId: 1, quizId: 2, questionId: 3, kind: 'multiple_choice', optionId: 0 },
        { canonicalId: 'course', moduleId: 1, quizId: 2, questionId: 3, kind: 'text', answer: 'Respuesta', optionId: 4 },
        { canonicalId: 'course', moduleId: 1, quizId: 2, questionId: 3, kind: 'multiple_choice', optionId: 4, answer: 'Respuesta' },
    ])('rejects an invalid or mixed answer command', (input) => {
        expect(SubmitQuizAnswerRequestSchema.safeParse(input).success).toBe(false);
    });
});
