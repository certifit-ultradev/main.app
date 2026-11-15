import { activate } from '@/actions/courses/activate';
import { createDraft, register, saveContent, updateBasics } from '@/actions/courses/register';
import { auth } from '@/auth';
import { activateCourse, createCourseDraft, registerCourse, saveCourseContent, updateCourseBasics } from '@/services/courses';
import type { CourseEditorDto } from '@/application/courses/course.dto';
import { safeLogger } from '@/shared/observability/safe-logger';

jest.mock('@/auth');
jest.mock('@/services/courses', () => ({
    activateCourse: jest.fn(),
    createCourseDraft: jest.fn(),
    registerCourse: jest.fn(),
    saveCourseContent: jest.fn(),
    updateCourseBasics: jest.fn(),
}));

describe('course action validation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (auth as jest.Mock).mockResolvedValue({ user: { id: 'admin', isAdmin: true, emailVerified: new Date() } });
    });

    afterEach(() => { jest.restoreAllMocks(); });

    it('does not activate a course with an invalid id', async () => {
        await expect(activate({ id: 0 })).resolves.toMatchObject({ ok: false, error: { code: 'VALIDATION' } });
        expect(activateCourse).not.toHaveBeenCalled();
    });

    it('does not report an incomplete draft as activated', async () => {
        (activateCourse as jest.Mock).mockResolvedValue({ success: false, message: 'El curso está incompleto.' });
        await expect(activate({ id: 7 })).resolves.toMatchObject({
            ok: false, error: { code: 'VALIDATION', message: 'El curso está incompleto.' },
        });
    });

    it('creates a basic draft without modules or images', async () => {
        (createCourseDraft as jest.Mock).mockResolvedValue({ id: 7, modules: [] });
        const result = await createDraft({
            draftKey: 'e1e55419-6c99-49eb-af38-92dd7b746364',
            title: 'Curso', price: 100, description: 'Descripción',
            instructorName: 'Ada', category: { id: 1, name: 'Tecnología' },
            expiresAt: '2030-01-01', courseImage: '', instructorPhoto: '',
        });
        expect(result).toMatchObject({ ok: true, data: { id: 7, modules: [] } });
        expect(createCourseDraft).toHaveBeenCalledWith(expect.objectContaining({ courseImage: '', instructorPhoto: '' }));
    });

    it('logs the basic step and course ID without logging exception contents', async () => {
        const log = jest.spyOn(safeLogger, 'error').mockImplementation(() => undefined);
        (updateCourseBasics as jest.Mock).mockRejectedValue(new Error('secret database detail'));

        const result = await updateBasics({ courseId: 42, basics: {
            title: 'Curso', price: 100, description: 'Descripción',
            instructorName: 'Ada', category: { id: 1, name: 'Tecnología' },
            expiresAt: '2030-01-01', courseImage: '', instructorPhoto: '',
        } });

        expect(result).toMatchObject({ ok: false, error: { code: 'UNEXPECTED' } });
        expect(log).toHaveBeenCalledWith('course.basics.update.failed', { courseId: 42, name: 'Error' });
    });

    it('maps a sparse basics update without replacing untouched fields', async () => {
        (updateCourseBasics as jest.Mock).mockResolvedValue(undefined);
        await expect(updateBasics({ courseId: 42, basics: { title: 'Nuevo título' } }))
            .resolves.toMatchObject({ ok: true });
        expect(updateCourseBasics).toHaveBeenCalledWith(42, { title: 'Nuevo título' });
    });

    it('rejects an empty basics update before writing', async () => {
        await expect(updateBasics({ courseId: 42, basics: {} }))
            .resolves.toMatchObject({ ok: false, error: { code: 'VALIDATION' } });
        expect(updateCourseBasics).not.toHaveBeenCalled();
    });

    it('logs failures from the content step with its course ID', async () => {
        const log = jest.spyOn(safeLogger, 'error').mockImplementation(() => undefined);
        (saveCourseContent as jest.Mock).mockRejectedValue(new Error('secret database detail'));

        const result = await saveContent({ courseId: 42, content: { modules: [{
            title: 'Módulo', minRequiredPoints: 1,
            classes: [{ title: 'Clase', description: 'Texto', video: 'https://example.com/video.mp4' }],
            quiz: { title: 'Quiz', description: 'Texto', questions: [{
                type: 'text', title: 'Pregunta', points: 1, expectedAnswer: { value: 'Respuesta' },
            }] },
        }] } });

        expect(result).toMatchObject({ ok: false, error: { code: 'UNEXPECTED' } });
        expect(log).toHaveBeenCalledWith('course.content.save.failed', { courseId: 42, name: 'Error' });
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
