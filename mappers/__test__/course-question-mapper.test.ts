import { toAuthorQuestionDto, toStudentQuestionDto } from '@/mappers/course-question-mapper';

const base = { id: 1, title: 'Pregunta', points: 5 };

describe('course question audience mapping', () => {
    it('represents text as one expected answer for authors and no answer for students', () => {
        const row = { ...base, type: 'text', possibleAnswerQuestion: [{ id: 2, value: 'Correcta', isCorrect: true }] };
        expect(toAuthorQuestionDto(row)).toEqual({ ...base, type: 'text', expectedAnswer: { value: 'Correcta' } });
        expect(toStudentQuestionDto(row)).toEqual({ id: 1, title: 'Pregunta', type: 'text' });
    });

    it('rejects corrupt author questions instead of coercing type or correction', () => {
        expect(() => toAuthorQuestionDto({ ...base, type: 'other', possibleAnswerQuestion: [] })).toThrow('Tipo de pregunta');
        expect(() => toAuthorQuestionDto({ ...base, type: 'text', possibleAnswerQuestion: [] })).toThrow('respuesta esperada');
        expect(() => toAuthorQuestionDto({ ...base, type: 'text', possibleAnswerQuestion: [{ id: 2, value: ' ', isCorrect: true }] })).toThrow('respuesta esperada');
        expect(() => toAuthorQuestionDto({ ...base, type: 'multiple', possibleAnswerQuestion: [
            { id: 2, value: 'A', isCorrect: true }, { id: 3, value: 'B', isCorrect: true },
        ] })).toThrow('una correcta');
    });

    it('prefers the column and falls back only to one valid legacy option', () => {
        expect(toAuthorQuestionDto({ ...base, type: 'text', expectedAnswer: 'Solo columna', possibleAnswerQuestion: [] }))
            .toEqual({ ...base, type: 'text', expectedAnswer: { value: 'Solo columna' } });
        expect(toAuthorQuestionDto({ ...base, type: 'text', expectedAnswer: 'Nueva', possibleAnswerQuestion: [
            { id: 2, value: 'Antigua', isCorrect: true },
        ] })).toEqual({ ...base, type: 'text', expectedAnswer: { value: 'Nueva' } });
        expect(toAuthorQuestionDto({ ...base, type: 'text', expectedAnswer: null, possibleAnswerQuestion: [
            { id: 2, value: 'Antigua', isCorrect: true },
        ] })).toEqual({ ...base, type: 'text', expectedAnswer: { value: 'Antigua' } });
        expect(() => toAuthorQuestionDto({ ...base, type: 'text', expectedAnswer: ' ', possibleAnswerQuestion: [
            { id: 2, value: 'Antigua', isCorrect: true },
        ] })).toThrow('respuesta esperada');
    });

    it('requires at least two student options without receiving corrections', () => {
        expect(() => toStudentQuestionDto({ ...base, type: 'multiple', possibleAnswerQuestion: [{ id: 2, value: 'A' }] }))
            .toThrow('al menos dos opciones');
        expect(toStudentQuestionDto({ ...base, type: 'multiple', possibleAnswerQuestion: [
            { id: 2, value: 'A' }, { id: 3, value: 'B' },
        ] })).toEqual({ id: 1, title: 'Pregunta', type: 'multiple', options: [
            { id: 2, value: 'A' }, { id: 3, value: 'B' },
        ] });
    });
});
