import type { CourseEditorDto } from '@/application/courses/course.dto';
import { toCourseEditorFormValues } from '@/features/courses/editor/course-editor-form.mapper';
import { toPersistableCourseEditorDraft } from '@/features/courses/editor/course-editor-form.types';
import { courseEditorModulesReducer } from '@/features/courses/editor/course-editor-modules.reducer';
import { CourseModulesSchema } from '@/features/courses/editor/editor-form.schema.client';
import { AdminCourseInputSchema } from '@/interfaces/actions/admin.contract';
import { toCourseEditorPatch, toCreateCourseCommand } from '@/interfaces/actions/course-editor.mapper';
import { toStudentQuestionDto } from '@/mappers/course-question-mapper';

const authorCourse: CourseEditorDto = {
    id: 10,
    canonicalId: 'curso-ts',
    title: 'Curso TypeScript',
    description: 'Descripción',
    price: 100,
    courseImage: 'https://example.com/course.png',
    instructorName: 'Ada',
    instructorPhoto: 'https://example.com/ada.png',
    expiresAt: '2030-01-01T00:00:00.000Z',
    category: { id: 11, name: 'Tecnología' },
    modules: [{
        id: 20,
        title: 'Módulo inicial',
        minRequiredPoints: 1,
        classes: [{
            id: 30, title: 'Clase', description: 'Descripción',
            video: 'https://example.com/class.mp4', videoSize: 100, videoDuration: 60,
        }],
        quiz: {
            id: 40, title: 'Quiz', description: 'Evaluación',
            questions: [
                { id: 50, type: 'text', title: 'Explique', points: 1, expectedAnswer: { value: 'Respuesta esperada' } },
                { id: 51, type: 'multiple', title: 'Elija', points: 1, options: [
                    { id: 61, value: 'A', isCorrect: true },
                    { id: 62, value: 'B', isCorrect: false },
                ] },
            ],
        },
    }],
};

describe('CourseEditorDto → editor form → action command', () => {
    it('hydrates stable keys and distinct question variants without mutating the author DTO', () => {
        const before = JSON.stringify(authorCourse);
        const form = toCourseEditorFormValues(authorCourse);
        const [text, multiple] = form.modules[0].quiz.questions;

        expect(form.modules[0].clientKey).toBe('module-20');
        expect(form.modules[0].classes[0].clientKey).toBe('class-30');
        expect(form.modules[0].quiz.clientKey).toBe('quiz-40');
        expect(text).toEqual({
            id: 50, clientKey: 'question-50', type: 'text', title: 'Explique', points: 1,
            expectedAnswer: { value: 'Respuesta esperada' },
        });
        expect(multiple).toEqual({
            id: 51, clientKey: 'question-51', type: 'multiple', title: 'Elija', points: 1,
            options: [
                { id: 61, clientKey: 'option-61', value: 'A', isCorrect: true },
                { id: 62, clientKey: 'option-62', value: 'B', isCorrect: false },
            ],
        });
        expect(CourseModulesSchema.safeParse(form.modules).success).toBe(true);
        expect(JSON.stringify(authorCourse)).toBe(before);
    });

    it('round-trips edit IDs and author answers through the validated action contract', () => {
        const form = toCourseEditorFormValues(authorCourse);
        const draft = toPersistableCourseEditorDraft(form);
        const parsed = AdminCourseInputSchema.parse(draft);
        const patch = toCourseEditorPatch(parsed);

        expect(JSON.stringify(draft)).not.toContain('clientKey');
        expect(draft).not.toHaveProperty('canonicalId');
        expect(patch.categoryId).toBe(11);
        expect(patch.modules[0].id).toBe(20);
        expect(patch.modules[0].classes[0].id).toBe(30);
        expect(patch.modules[0].quiz.id).toBe(40);
        expect(patch.modules[0].quiz.questions).toEqual([
            { id: 50, type: 'text', title: 'Explique', points: 1, expectedAnswer: { value: 'Respuesta esperada' } },
            { id: 51, type: 'multiple', title: 'Elija', points: 1, options: [
                { id: 61, value: 'A', isCorrect: true }, { id: 62, value: 'B', isCorrect: false },
            ] },
        ]);
        expect(patch.modules[0].quiz.questions[0]).not.toHaveProperty('options');
    });

    it('drops edit IDs for creation but keeps the two answer variants', () => {
        const parsed = AdminCourseInputSchema.parse(toPersistableCourseEditorDraft(toCourseEditorFormValues(authorCourse)));
        const create = toCreateCourseCommand(parsed);

        expect(create.modules[0]).not.toHaveProperty('id');
        expect(create.modules[0].quiz.questions).toEqual([
            { type: 'text', title: 'Explique', points: 1, expectedAnswer: 'Respuesta esperada' },
            { type: 'multiple', title: 'Elija', points: 1, options: [
                { value: 'A', isCorrect: true }, { value: 'B', isCorrect: false },
            ] },
        ]);
    });

    it('drops the old answer identity when an author switches question type', () => {
        const form = toCourseEditorFormValues(authorCourse);
        const changed = courseEditorModulesReducer(form.modules, {
            type: 'changeQuestionType', moduleIndex: 0, questionIndex: 0, questionType: 'multiple',
        });
        const question = changed[0].quiz.questions[0];

        expect(question).toMatchObject({ id: 50, clientKey: 'question-50', type: 'multiple' });
        expect(question).not.toHaveProperty('expectedAnswer');
        if (question.type !== 'multiple') throw new Error('Expected multiple choice');
        expect(question.options.every((option) => option.id === undefined)).toBe(true);
        expect(form.modules[0].quiz.questions[0]).not.toHaveProperty('expectedAnswer.id');
    });

    it('keeps the student projection free of answer and correction fields', () => {
        const text = toStudentQuestionDto({
            id: 50, type: 'text', title: 'Explique',
            possibleAnswerQuestion: [{ id: 60, value: 'Respuesta esperada' }],
        });
        const multiple = toStudentQuestionDto({
            id: 51, type: 'multiple', title: 'Elija',
            possibleAnswerQuestion: [{ id: 61, value: 'A' }, { id: 62, value: 'B' }],
        });
        expect(text).toEqual({ id: 50, type: 'text', title: 'Explique' });
        expect(multiple).toEqual({ id: 51, type: 'multiple', title: 'Elija', options: [
            { id: 61, value: 'A' }, { id: 62, value: 'B' },
        ] });
        expect(JSON.stringify([text, multiple])).not.toContain('Respuesta esperada');
        expect(JSON.stringify([text, multiple])).not.toContain('isCorrect');
    });

    it('creates an empty local quiz for a legacy module without one', () => {
        const form = toCourseEditorFormValues({
            ...authorCourse,
            modules: [{ ...authorCourse.modules[0], quiz: null }],
        });
        expect(form.modules[0].quiz).toMatchObject({ title: '', description: '', questions: [] });
        expect(form.modules[0].quiz.clientKey).toMatch(/^quiz-/);
    });
});
