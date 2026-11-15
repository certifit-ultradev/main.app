import {
    toPersistableCourseEditorDraft,
    type CourseEditorFormValues,
    type CourseEditorQuestion,
} from '@/features/courses/editor/course-editor-form.types';

// @ts-expect-error Text questions cannot carry multiple-choice options.
const textWithOptions: CourseEditorQuestion = { type: 'text', title: 'Explique', points: 1, expectedAnswer: { value: 'A' }, options: [] };
// @ts-expect-error Multiple-choice questions cannot carry a text answer.
const multipleWithAnswer: CourseEditorQuestion = { type: 'multiple', title: 'Elija', points: 1, options: [], expectedAnswer: { value: 'A' } };
void textWithOptions;
void multipleWithAnswer;

const form: CourseEditorFormValues = {
    title: 'Curso', price: 100, courseImage: 'https://example.com/course.png',
    instructorName: 'Instructor', instructorPhoto: 'https://example.com/instructor.png',
    category: { id: 1, name: 'Categoría' }, description: 'Descripción', expiresAt: '2030-01-01',
    modules: [{ title: 'Módulo', minRequiredPoints: 1, classes: [{ title: 'Clase', description: 'Descripción', video: 'https://example.com/video.mp4' }], quiz: { title: 'Quiz', description: 'Descripción', questions: [] } }],
};

describe('toPersistableCourseEditorDraft', () => {
    it('returns a serializable draft with stored assets only', () => {
        expect(toPersistableCourseEditorDraft(form)).toEqual(form);
    });

    it('rejects local files before a server action can receive them', () => {
        const localAsset = { ...form, courseImage: new File(['image'], 'course.png', { type: 'image/png' }) };
        expect(() => toPersistableCourseEditorDraft(localAsset)).toThrow('La imagen del curso debe estar cargado');
    });

    it('serializes each question variant without editor keys or incompatible fields', () => {
        const questions: CourseEditorQuestion[] = [
            { id: 1, clientKey: 'question-1', type: 'text', title: 'Explique', points: 1, expectedAnswer: { value: 'Respuesta' } },
            { id: 3, clientKey: 'question-3', type: 'multiple', title: 'Elija', points: 1, options: [
                { id: 4, clientKey: 'option-4', value: 'A', isCorrect: true },
                { id: 5, clientKey: 'option-5', value: 'B', isCorrect: false },
            ] },
        ];
        const source: CourseEditorFormValues = {
            ...form,
            modules: [{ ...form.modules[0], quiz: { ...form.modules[0].quiz, questions } }],
        };
        const draft = toPersistableCourseEditorDraft(source);

        expect(draft.modules[0].quiz.questions).toEqual([
            { id: 1, type: 'text', title: 'Explique', points: 1, expectedAnswer: { value: 'Respuesta' } },
            { id: 3, type: 'multiple', title: 'Elija', points: 1, options: [
                { id: 4, value: 'A', isCorrect: true }, { id: 5, value: 'B', isCorrect: false },
            ] },
        ]);
        expect(JSON.stringify(draft)).not.toContain('clientKey');
        expect(questions[0]).toHaveProperty('clientKey', 'question-1');
        expect(questions[1]).toHaveProperty('clientKey', 'question-3');
    });
});
