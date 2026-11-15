import { toCatalogCourseCardDto, toCourseEditorDto } from '@/mappers/course-audience-mapper';
import { Course } from '@/models/course';
import { CourseModules } from '@/models/course-modules';
import { ModuleQuiz } from '@/models/module-quiz';
import { QuizQuestion } from '@/models/quiz-question';
import { PossibleAnswerQuestion } from '@/models/possible-answer-question';

const makeCourse = () => {
    const answer = new PossibleAnswerQuestion({ id: 5, questionId: 4, value: 'Correcta', isCorrect: true });
    const question = new QuizQuestion({ id: 4, quizId: 3, title: 'Pregunta', type: 'text', points: 1, possibleAnswerQuestion: [answer] });
    const quiz = new ModuleQuiz({ id: 3, courseModuleId: 2, title: 'Quiz', description: 'Evaluación', quizQuestion: [question] });
    const module = new CourseModules({
        id: 2, courseId: 1, title: 'Módulo', minRequiredPoints: 1,
        createdAt: new Date('2030-01-01T00:00:00.000Z'), moduleQuiz: [quiz], moduleClass: [],
    });
    const course = new Course({
        id: 1, title: 'Curso', canonicalId: 'curso', description: 'Descripción',
        courseImage: 'https://example.com/course.png', categoryId: 1, isActive: true, price: 100,
        instructorName: 'Ada', instructorPhoto: 'https://example.com/ada.png', deleted: false,
        expiresAt: new Date('2030-01-01T00:00:00.000Z'), createdAt: new Date('2026-01-01T00:00:00.000Z'),
        courseModules: [module],
    });
    return { course, module, quiz, question, answer };
};

describe('legacy course audience mapper', () => {
    it('maps persisted IDs and author answers without changing their shape', () => {
        const { course } = makeCourse();
        expect(toCatalogCourseCardDto(course, false).id).toBe(1);
        expect(toCourseEditorDto(course).modules[0].quiz?.questions[0]).toEqual({
            id: 4, type: 'text', title: 'Pregunta', points: 1,
            expectedAnswer: { value: 'Correcta' },
        });
    });

    it('rejects missing or invalid IDs instead of asserting them', () => {
        const withoutCourseId = makeCourse();
        withoutCourseId.course.id = undefined;
        expect(() => toCatalogCourseCardDto(withoutCourseId.course, false)).toThrow('Curso no tiene un identificador');

        const withoutModuleId = makeCourse();
        withoutModuleId.module.id = undefined;
        expect(() => toCourseEditorDto(withoutModuleId.course)).toThrow('Módulo no tiene un identificador');

        const withoutOptionId = makeCourse();
        withoutOptionId.question.type = 'multiple';
        withoutOptionId.answer.id = undefined;
        expect(() => toCourseEditorDto(withoutOptionId.course)).toThrow('Opción no tiene un identificador');
    });
});
