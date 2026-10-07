import { AdminCourseInputSchema } from '@/interfaces/actions/admin.contract';
import { toCourseEditorPatch, toCreateCourseCommand } from '@/interfaces/actions/course-editor.mapper';

const input = {
    title: 'Curso', price: 100, courseImage: 'https://example.com/course.png',
    instructorName: 'Ada', instructorPhoto: 'https://example.com/ada.png',
    category: { id: 1, name: 'Tecnología' }, description: 'Curso', expiresAt: '2030-01-01T00:00:00.000Z',
    modules: [{
        title: 'Módulo', minRequiredPoints: 1, classes: [],
        quiz: { title: 'Quiz', description: 'Preguntas', questions: [
            { type: 'text', title: 'Explique', points: 1, expectedAnswer: { value: 'Respuesta' } },
            { type: 'multiple', title: 'Elija', points: 1, options: [
                { id: 5, value: 'Sí', isCorrect: true }, { id: 6, value: 'No', isCorrect: false },
            ] },
        ] },
    }],
};

describe('course action to application command', () => {
    it('keeps text answers separate from multiple-choice options', () => {
        const parsed = AdminCourseInputSchema.parse(input);
        expect(toCourseEditorPatch(parsed).modules[0].quiz.questions).toEqual([
            { id: undefined, type: 'text', title: 'Explique', points: 1, expectedAnswer: { value: 'Respuesta' } },
            { id: undefined, type: 'multiple', title: 'Elija', points: 1, options: [
                { id: 5, value: 'Sí', isCorrect: true }, { id: 6, value: 'No', isCorrect: false },
            ] },
        ]);
        expect(toCreateCourseCommand(parsed).modules[0].quiz.questions).toEqual([
            { type: 'text', title: 'Explique', points: 1, expectedAnswer: 'Respuesta' },
            { type: 'multiple', title: 'Elija', points: 1, options: [
                { value: 'Sí', isCorrect: true }, { value: 'No', isCorrect: false },
            ] },
        ]);
    });
});
