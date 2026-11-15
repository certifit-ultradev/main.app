import { assertValidCourseQuestion } from '@/application/courses/course-question.validation';

describe('application course-question invariant', () => {
    it('requires a nonempty expected text answer', () => {
        expect(() => assertValidCourseQuestion({ type: 'text', title: 'Texto', points: 1, expectedAnswer: 'Respuesta' })).not.toThrow();
        expect(() => assertValidCourseQuestion({ type: 'text', title: 'Texto', points: 1, expectedAnswer: { value: ' ' } }))
            .toThrow('respuesta esperada');
    });

    it('requires two nonempty options and exactly one correct answer', () => {
        expect(() => assertValidCourseQuestion({ type: 'multiple', title: 'Elija', points: 1, options: [
            { value: 'A', isCorrect: true }, { value: 'B', isCorrect: false },
        ] })).not.toThrow();
        expect(() => assertValidCourseQuestion({ type: 'multiple', title: 'Elija', points: 1, options: [
            { value: 'A', isCorrect: true }, { value: 'B', isCorrect: true },
        ] })).toThrow('exactamente una correcta');
        expect(() => assertValidCourseQuestion({ type: 'multiple', title: 'Elija', points: 1, options: [
            { value: 'A', isCorrect: false }, { value: 'B', isCorrect: false },
        ] })).toThrow('exactamente una correcta');
    });
});
