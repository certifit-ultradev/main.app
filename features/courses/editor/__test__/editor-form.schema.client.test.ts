import { CourseBasicInfoSchema, CourseModulesSchema } from '@/features/courses/editor/editor-form.schema.client';

const baseModule = {
    title: 'Módulo válido',
    minRequiredPoints: 1,
    classes: [{ title: 'Clase', description: 'Descripción', video: 'https://example.com/video.mp4' }],
    quiz: { title: 'Quiz', description: 'Descripción', questions: [] as unknown[] },
};

describe('CourseModulesSchema', () => {
    it('accepts a multiple-choice question with exactly one correct option', () => {
        const module = {
            ...baseModule,
            quiz: {
                ...baseModule.quiz,
                questions: [{
                    type: 'multiple', title: 'Pregunta', points: 1,
                    options: [{ value: 'A', isCorrect: true }, { value: 'B', isCorrect: false }],
                }],
            },
        };

        expect(CourseModulesSchema.safeParse([module]).success).toBe(true);
    });

    it.each([
        { options: [{ value: 'A', isCorrect: true }] },
        { options: [{ value: 'A', isCorrect: true }, { value: 'B', isCorrect: true }] },
        { options: [{ value: 'A', isCorrect: false }, { value: 'B', isCorrect: false }] },
    ])('rejects an invalid multiple-choice answer set', ({ options }) => {
        const module = {
            ...baseModule,
            quiz: { ...baseModule.quiz, questions: [{ type: 'multiple', title: 'Pregunta', points: 1, options }] },
        };

        expect(CourseModulesSchema.safeParse([module]).success).toBe(false);
    });

    it.each([
        { answer: { value: 'Esperada' }, expected: true },
        { answer: { id: 4, value: 'Esperada' }, expected: false },
        { answer: { value: '' }, expected: false },
        { answer: { value: '   ' }, expected: false },
    ])('validates the direct expected answer for text questions', ({ answer, expected }) => {
        const module = {
            ...baseModule,
            quiz: { ...baseModule.quiz, questions: [{ type: 'text', title: 'Pregunta', points: 1, expectedAnswer: answer }] },
        };

        expect(CourseModulesSchema.safeParse([module]).success).toBe(expected);
    });

    it('rejects fields from the opposite question variant', () => {
        const textWithOptions = {
            type: 'text', title: 'Pregunta', points: 1,
            expectedAnswer: { value: 'Esperada' }, options: [{ value: 'Ficticia', isCorrect: true }],
        };
        const multipleWithAnswer = {
            type: 'multiple', title: 'Pregunta', points: 1,
            options: [{ value: 'A', isCorrect: true }, { value: 'B', isCorrect: false }],
            expectedAnswer: { value: 'No debe estar' },
        };
        for (const question of [textWithOptions, multipleWithAnswer]) {
            expect(CourseModulesSchema.safeParse([{ ...baseModule, quiz: { ...baseModule.quiz, questions: [question] } }]).success).toBe(false);
        }
    });
});

describe('CourseBasicInfoSchema preprocessing', () => {
    const basic = {
        title: 'Curso', description: 'Descripción', price: 100,
        courseImage: 'https://example.com/course.png', instructorName: 'Ada',
        instructorPhoto: 'https://example.com/ada.png', category: { id: 1 },
        expiresAt: '2030-01-01T00:00:00.000Z',
    };

    it('accepts numeric strings and ISO dates from form controls', () => {
        expect(CourseBasicInfoSchema.safeParse({ ...basic, price: '120' }).success).toBe(true);
    });

    it('rejects objects and empty strings instead of coercing unknown values', () => {
        expect(CourseBasicInfoSchema.safeParse({ ...basic, price: { value: 120 } }).success).toBe(false);
        expect(CourseBasicInfoSchema.safeParse({ ...basic, price: '' }).success).toBe(false);
        expect(CourseBasicInfoSchema.safeParse({ ...basic, expiresAt: { value: '2030-01-01' } }).success).toBe(false);
    });
});
