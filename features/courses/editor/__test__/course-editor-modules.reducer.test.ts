import {
    courseEditorModulesReducer,
    hydrateEditorModules,
} from '@/features/courses/editor/course-editor-modules.reducer';
import { toPersistableCourseEditorDraft, type CourseEditorFormValues } from '@/features/courses/editor/course-editor-form.types';

const multipleQuestion = (state: CourseEditorFormValues['modules']) => {
    const item = state[0].quiz.questions[0];
    if (item.type !== 'multiple') throw new Error('Expected a multiple-choice question');
    return item;
};

const modules = hydrateEditorModules([{
    id: 1,
    title: 'Módulo',
    minRequiredPoints: 5,
    classes: [{ id: 2, title: 'Clase', description: 'Descripción', video: null }],
    quiz: {
        id: 3,
        title: 'Quiz',
        description: 'Descripción',
        questions: [{
            id: 4,
            type: 'multiple',
            title: 'Pregunta',
            points: 2,
            options: [
                { id: 5, value: 'A', isCorrect: false },
                { id: 6, value: 'B', isCorrect: true },
            ],
        }],
    },
}]);

describe('courseEditorModulesReducer', () => {
    it('updates nested data without mutating the previous state', () => {
        const next = courseEditorModulesReducer(modules, {
            type: 'updateOption',
            moduleIndex: 0,
            questionIndex: 0,
            optionIndex: 0,
            patch: { isCorrect: true },
        });

        expect(next).not.toBe(modules);
        expect(next[0]).not.toBe(modules[0]);
        expect(multipleQuestion(next).options[0].isCorrect).toBe(true);
        expect(multipleQuestion(next).options[1].isCorrect).toBe(false);
        expect(multipleQuestion(modules).options).toEqual(expect.arrayContaining([
            expect.objectContaining({ id: 5, isCorrect: false }),
            expect.objectContaining({ id: 6, isCorrect: true }),
        ]));
    });

    it('assigns stable client keys to persisted and new editor entities', () => {
        const hydrated = hydrateEditorModules(modules);
        const withQuestion = courseEditorModulesReducer(hydrated, { type: 'addQuestion', moduleIndex: 0 });

        expect(hydrated[0].clientKey).toBe('module-1');
        expect(hydrated[0].classes[0].clientKey).toBe('class-2');
        expect(hydrated[0].quiz.questions[0].clientKey).toBe('question-4');
        expect(withQuestion[0].quiz.questions[1].clientKey).toMatch(/^question-/);
    });

    it('removes editor-only keys before a draft crosses the server boundary', () => {
        const form: CourseEditorFormValues = {
            title: 'Curso', price: 10, courseImage: 'course.png', instructorName: 'Instructor', instructorPhoto: 'photo.png',
            category: { id: 1, name: 'Categoría' }, description: 'Descripción', expiresAt: '2030-01-01', modules,
        };

        expect(JSON.stringify(toPersistableCourseEditorDraft(form))).not.toContain('clientKey');
    });

    it('rebuilds question variants and clears incompatible answer fields without mutating prior state', () => {
        const original = multipleQuestion(modules);
        const text = courseEditorModulesReducer(modules, {
            type: 'changeQuestionType', moduleIndex: 0, questionIndex: 0, questionType: 'text',
        });
        const textQuestion = text[0].quiz.questions[0];
        expect(textQuestion).toMatchObject({ id: 4, clientKey: 'question-4', type: 'text', expectedAnswer: { value: '' } });
        expect(textQuestion).not.toHaveProperty('options');
        expect(original.options).toHaveLength(2);

        const edited = courseEditorModulesReducer(text, {
            type: 'updateExpectedAnswer', moduleIndex: 0, questionIndex: 0, value: 'Respuesta válida',
        });
        expect(edited[0].quiz.questions[0]).toMatchObject({ expectedAnswer: { value: 'Respuesta válida' } });
        expect(textQuestion).toMatchObject({ expectedAnswer: { value: '' } });

        const multiple = courseEditorModulesReducer(edited, {
            type: 'changeQuestionType', moduleIndex: 0, questionIndex: 0, questionType: 'multiple',
        });
        const rebuilt = multipleQuestion(multiple);
        expect(rebuilt).not.toHaveProperty('expectedAnswer');
        expect(rebuilt.options).toHaveLength(2);
        expect(rebuilt.options.filter((item) => item.isCorrect)).toHaveLength(1);
        expect(rebuilt.options[0].clientKey).not.toBe(rebuilt.options[1].clientKey);
        expect(rebuilt.options.every((item) => item.id === undefined)).toBe(true);
    });

    it('ignores option actions for text questions and preserves a stored answer id when edited', () => {
        const state = hydrateEditorModules([{ ...modules[0], quiz: {
            ...modules[0].quiz,
            questions: [{ id: 4, type: 'text', title: 'Explique', points: 2, expectedAnswer: { value: 'Antes' } }],
        } }]);
        const previous = state[0].quiz.questions[0];
        const attemptedOptionEdit = courseEditorModulesReducer(state, {
            type: 'addOption', moduleIndex: 0, questionIndex: 0,
        });
        expect(attemptedOptionEdit[0].quiz.questions[0]).toBe(previous);

        const edited = courseEditorModulesReducer(state, {
            type: 'updateExpectedAnswer', moduleIndex: 0, questionIndex: 0, value: 'Después',
        });
        expect(edited[0].quiz.questions[0]).toMatchObject({ expectedAnswer: { value: 'Después' } });
        expect(previous).toMatchObject({ expectedAnswer: { value: 'Antes' } });
    });

    it('removes options and questions by their selected position without reusing client keys', () => {
        const withoutOption = courseEditorModulesReducer(modules, {
            type: 'removeOption', moduleIndex: 0, questionIndex: 0, optionIndex: 0,
        });
        expect(multipleQuestion(withoutOption).options).toEqual([expect.objectContaining({ id: 6 })]);
        expect(multipleQuestion(modules).options).toHaveLength(2);
        const withoutQuestion = courseEditorModulesReducer(withoutOption, {
            type: 'removeQuestion', moduleIndex: 0, questionIndex: 0,
        });
        expect(withoutQuestion[0].quiz.questions).toEqual([]);
    });
});
