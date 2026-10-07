import type { CourseEditorQuestionPatch, CreateCourseCommand } from './course-editor.commands';

type CreateQuestion = CreateCourseCommand['modules'][number]['quiz']['questions'][number];

/** Protects the application port even when a caller bypasses the validated action. */
export function assertValidCourseQuestion(question: CourseEditorQuestionPatch | CreateQuestion): void {
    if (question.type === 'text') {
        const value = typeof question.expectedAnswer === 'string'
            ? question.expectedAnswer
            : question.expectedAnswer.value;
        if (!value.trim()) throw new Error('La pregunta de texto requiere una respuesta esperada');
        return;
    }
    if (question.type === 'multiple') {
        if (question.options.length < 2 || question.options.some((option) => !option.value.trim())
            || question.options.filter((option) => option.isCorrect).length !== 1) {
            throw new Error('La pregunta de selección requiere al menos dos opciones y exactamente una correcta');
        }
        return;
    }
    throw new Error('Tipo de pregunta no válido');
}
