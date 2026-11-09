import { AdminCourseInputSchema } from '@/interfaces/actions/admin.contract';

const baseCourse = {
    title: 'Curso de prueba',
    price: 100,
    courseImage: 'https://example.com/course.png',
    instructorName: 'Ada Lovelace',
    instructorPhoto: 'https://example.com/ada.png',
    category: { id: 1, name: 'Tecnología' },
    description: 'Descripción del curso',
    expiresAt: '2030-01-01T00:00:00.000Z',
    modules: [{
        minRequiredPoints: 1,
        title: 'Módulo inicial',
        classes: [{ title: 'Clase 1', description: 'Introducción', video: 'https://example.com/class.mp4' }],
        quiz: { title: 'Quiz', description: 'Evaluación', questions: [] as unknown[] },
    }],
};

describe('AdminCourseInputSchema question union', () => {
    it.each([
        { type: 'multiple', title: 'Seleccione una', points: 1, options: [{ value: 'A', isCorrect: true }, { value: 'B', isCorrect: false }] },
        { type: 'text', title: 'Explique', points: 1, expectedAnswer: { value: 'Respuesta esperada' } },
    ])('accepts the persistable %s question variant', (question) => {
        const input = structuredClone(baseCourse);
        input.modules[0].quiz.questions = [question];

        expect(AdminCourseInputSchema.safeParse(input).success).toBe(true);
    });

    it.each([
        { type: 'multiple', title: 'Seleccione una', points: 1, options: [{ value: 'A', isCorrect: true }] },
        { type: 'text', title: 'Explique', points: 1, expectedAnswer: { value: '' } },
        { type: 'text', title: 'Explique', points: 1, expectedAnswer: { id: 4, value: 'Respuesta' } },
        { type: 'text', title: 'Explique', points: 1, expectedAnswer: { value: 'A' }, options: [{ value: 'A', isCorrect: true }] },
        { type: 'multiple', title: 'Seleccione', points: 1, expectedAnswer: { value: 'A' }, options: [{ value: 'A', isCorrect: true }, { value: 'B', isCorrect: false }] },
        { type: 'unsupported', title: 'Pregunta', points: 1, options: [] },
    ])('rejects an invalid question variant', (question) => {
        const input = structuredClone(baseCourse);
        input.modules[0].quiz.questions = [question];

        expect(AdminCourseInputSchema.safeParse(input).success).toBe(false);
    });
});
