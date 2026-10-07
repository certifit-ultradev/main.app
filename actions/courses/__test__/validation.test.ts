import { activate } from '@/actions/courses/activate';
import { register } from '@/actions/courses/register';
import { auth } from '@/auth';
import { activateCourse, registerCourse } from '@/services/courses';
import type { CourseEditorDto } from '@/application/courses/course.dto';

jest.mock('@/auth');
jest.mock('@/services/courses', () => ({
    activateCourse: jest.fn(),
    registerCourse: jest.fn(),
}));

describe('course action validation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (auth as jest.Mock).mockResolvedValue({ user: { id: 'admin', isAdmin: true, emailVerified: new Date() } });
    });

    it('does not activate a course with an invalid id', async () => {
        await expect(activate({ id: 0 })).resolves.toMatchObject({ ok: false, error: { code: 'VALIDATION' } });
        expect(activateCourse).not.toHaveBeenCalled();
    });

    it('does not create a course from an incomplete command', async () => {
        await expect(register({ title: 'Incomplete' })).resolves.toMatchObject({ ok: false, error: { code: 'VALIDATION' } });
        expect(registerCourse).not.toHaveBeenCalled();
    });

    it('returns the serializable editor DTO produced by the service', async () => {
        const createdCourse: CourseEditorDto = {
            id: 1, canonicalId: 'curso', title: 'Curso', description: 'Descripción', price: 100,
            courseImage: 'https://example.com/course.jpg', instructorName: 'Docente',
            instructorPhoto: 'https://example.com/teacher.jpg', expiresAt: '2030-01-01T00:00:00.000Z',
            category: { id: 1, name: 'Categoría' },
            modules: [{
                id: 2, title: 'Módulo', minRequiredPoints: 1,
                classes: [{ id: 3, title: 'Clase', description: 'Descripción', video: null, videoSize: null, videoDuration: null }],
                quiz: { id: 4, title: 'Quiz', description: 'Descripción', questions: [] },
            }],
        };
        (registerCourse as jest.Mock).mockResolvedValue(createdCourse);

        const result = await register({
            title: 'Curso', price: 100, courseImage: 'https://example.com/course.jpg', instructorName: 'Docente',
            instructorPhoto: 'https://example.com/teacher.jpg', category: { id: 1, name: 'Categoría' },
            description: 'Descripción', expiresAt: '2030-01-01T00:00:00.000Z',
            modules: [{
                title: 'Módulo', minRequiredPoints: 1,
                classes: [{ title: 'Clase', description: 'Descripción', video: null }],
                quiz: { title: 'Quiz', description: 'Descripción', questions: [{
                    title: 'Pregunta', type: 'multiple', points: 1,
                    options: [{ value: 'A', isCorrect: true }, { value: 'B', isCorrect: false }],
                }] },
            }],
        });

        expect(result).toMatchObject({ ok: true, data: createdCourse });
        const [command] = (registerCourse as jest.Mock).mock.calls[0];
        expect(command).toMatchObject({ categoryId: 1, courseImage: 'https://example.com/course.jpg' });
        expect(command).not.toHaveProperty('category');
        expect(command.modules[0]).not.toHaveProperty('id');
        expect(command.modules[0].quiz.questions[0]).not.toHaveProperty('id');
        if (result.ok) expect(JSON.parse(JSON.stringify(result.data))).toEqual(createdCourse);
    });

    it('sends a text answer to the application command without a fictitious option', async () => {
        (registerCourse as jest.Mock).mockResolvedValue({ id: 1 });
        await register({
            title: 'Curso', price: 100, courseImage: 'https://example.com/course.jpg', instructorName: 'Docente',
            instructorPhoto: 'https://example.com/teacher.jpg', category: { id: 1, name: 'Categoría' },
            description: 'Descripción', expiresAt: '2030-01-01T00:00:00.000Z',
            modules: [{
                title: 'Módulo', minRequiredPoints: 1,
                classes: [{ title: 'Clase', description: 'Descripción', video: null }],
                quiz: { title: 'Quiz', description: 'Descripción', questions: [{
                    title: 'Explique', type: 'text', points: 1, expectedAnswer: { value: 'Respuesta' },
                }] },
            }],
        });

        const [command] = (registerCourse as jest.Mock).mock.calls[0];
        expect(command.modules[0].quiz.questions[0]).toEqual({
            title: 'Explique', type: 'text', points: 1, expectedAnswer: 'Respuesta',
        });
        expect(command.modules[0].quiz.questions[0]).not.toHaveProperty('options');
    });
});
