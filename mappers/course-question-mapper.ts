import type { AuthorQuestionDto, AuthorQuestionValidationIssue } from '@/application/courses/course.dto';
import type { StudentQuestionDto } from '@/application/courses/student-course.dto';
import { resolveTextAnswer } from './course-text-answer';

type AuthorQuestionRow = {
    id: number;
    type: unknown;
    title: string;
    points: number;
    expectedAnswer?: string | null;
    possibleAnswerQuestion: Array<{ id: number; value: string; isCorrect: boolean }>;
};

type StudentQuestionRow = {
    id: number;
    type: unknown;
    title: string;
    possibleAnswerQuestion: Array<{ id: number; value: string }>;
};

function mapAuthorQuestion(question: AuthorQuestionRow, allowIncomplete: boolean): AuthorQuestionDto {
    const base = { id: question.id, title: question.title, points: question.points };
    const options = question.possibleAnswerQuestion;
    if (question.type === 'text') {
        const expectedAnswer = resolveTextAnswer(question.expectedAnswer, options);
        if (expectedAnswer === null && !allowIncomplete) {
            throw new Error('La pregunta de texto debe tener una respuesta esperada no vacía');
        }
        return {
            ...base,
            type: 'text',
            expectedAnswer: { value: expectedAnswer ?? '' },
            ...(expectedAnswer === null ? { validationIssue: 'missing_text_answer' as const } : {}),
        };
    }
    if (question.type === 'multiple') {
        const validationIssue: AuthorQuestionValidationIssue | null = options.length < 2
            ? 'insufficient_options'
            : options.some((option) => !option.value.trim())
                ? 'empty_option'
                : options.filter((option) => option.isCorrect).length !== 1
                    ? 'invalid_correct_answer_count'
                    : null;
        if (validationIssue && !allowIncomplete) {
            throw new Error('La pregunta de selección debe tener al menos dos opciones y una correcta');
        }
        return {
            ...base,
            type: 'multiple',
            options: options.map((option) => ({ ...option })),
            ...(validationIssue ? { validationIssue } : {}),
        };
    }
    throw new Error('Tipo de pregunta no válido');
}

/** Strict mapping for valid author-facing records. */
export function toAuthorQuestionDto(question: AuthorQuestionRow): AuthorQuestionDto {
    return mapAuthorQuestion(question, false);
}

/** Preserves incomplete legacy answers so an administrator can repair them. */
export function toEditableAuthorQuestionDto(question: AuthorQuestionRow): AuthorQuestionDto {
    return mapAuthorQuestion(question, true);
}

export function toStudentQuestionDto(question: StudentQuestionRow): StudentQuestionDto {
    const base = { id: question.id, title: question.title };
    if (question.type === 'text') return { ...base, type: 'text' };
    if (question.type === 'multiple') {
        if (question.possibleAnswerQuestion.length < 2) {
            throw new Error('La pregunta de selección debe tener al menos dos opciones');
        }
        return {
            ...base,
            type: 'multiple',
            options: question.possibleAnswerQuestion.map(({ id, value }) => ({ id, value })),
        };
    }
    throw new Error('Tipo de pregunta no válido');
}
