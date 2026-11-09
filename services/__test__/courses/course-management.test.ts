import { logPrismaError } from '@/exceptions/error-encoder';
import { prismaCourseEditorWritePort } from '@/repository/course-editor.prisma';
import { prismaCourseEditorReadPort } from '@/repository/course-read.prisma';
import { activateCourse, deactivateCourse, editCourse, registerCourse, updateClassVideoPath } from '@/services/courses';
import type { CreateCourseCommand } from '@/application/courses/course-editor.commands';

jest.mock('@/repository/course-editor.prisma', () => ({
    prismaCourseEditorWritePort: { createCourse: jest.fn(), setCourseActive: jest.fn(), setClassVideo: jest.fn(), updateCourse: jest.fn() },
}));
jest.mock('@/repository/course-read.prisma', () => ({ prismaCourseEditorReadPort: { countActiveCourses: jest.fn(), findEditorCourseById: jest.fn() } }));
jest.mock('@/exceptions/error-encoder');
jest.mock('@/auth');

describe('Courses Service - Course Management', () => {
    beforeEach(() => jest.clearAllMocks());

    it('delegates an explicit editor patch without a diff or UI paths', async () => {
        const patch = {
            title: 'Curso', description: 'Descripción', price: 100, categoryId: 1,
            instructorName: 'Docente', courseImage: 'https://example.com/course.jpg',
            instructorPhoto: 'https://example.com/teacher.jpg', expiresAt: new Date(), modules: [],
        };
        await editCourse(1, patch);
        expect(prismaCourseEditorWritePort.updateCourse).toHaveBeenCalledWith(1, patch);
    });

    it('propagates editor persistence errors', async () => {
        const error = new Error('Módulo inválido para el curso');
        (prismaCourseEditorWritePort.updateCourse as jest.Mock).mockRejectedValue(error);
        await expect(editCourse(1, { modules: [] } as never)).rejects.toThrow(error);
        expect(logPrismaError).toHaveBeenCalledWith(error);
    });

    it('creates through the editor write port and returns a serializable editor DTO', async () => {
        (prismaCourseEditorWritePort.createCourse as jest.Mock).mockResolvedValue(1);
        (prismaCourseEditorReadPort.findEditorCourseById as jest.Mock).mockResolvedValue({
            id: 1, canonicalId: 'curso', title: 'Curso', description: 'Descripción', price: 100,
            courseImage: 'https://example.com/course.jpg', instructorName: 'Docente',
            instructorPhoto: 'https://example.com/teacher.jpg', expiresAt: '2030-01-01T00:00:00.000Z',
            category: null, modules: [],
        });
        const command = { modules: [] } as never;
        await expect(registerCourse(command)).resolves.toEqual(expect.objectContaining({
            id: 1,
            expiresAt: '2030-01-01T00:00:00.000Z',
        }));
        expect(prismaCourseEditorWritePort.createCourse).toHaveBeenCalledWith(command);
    });

    it('rejects invalid question commands before writing a course', async () => {
        const command: CreateCourseCommand = {
            title: 'Curso', description: 'Descripción', price: 100, categoryId: 1,
            instructorName: 'Docente', courseImage: 'https://example.com/course.jpg',
            instructorPhoto: 'https://example.com/teacher.jpg', expiresAt: new Date(),
            modules: [{ title: 'Módulo', minRequiredPoints: 1, classes: [], quiz: {
                title: 'Quiz', description: 'Preguntas', questions: [{
                    type: 'multiple', title: 'Elija', points: 1, options: [
                        { value: 'A', isCorrect: true }, { value: 'B', isCorrect: true },
                    ],
                }],
            } }],
        };

        await expect(registerCourse(command)).rejects.toThrow('exactamente una correcta');
        expect(prismaCourseEditorWritePort.createCourse).not.toHaveBeenCalled();
    });

    it('keeps activation and video commands', async () => {
        (prismaCourseEditorReadPort.countActiveCourses as jest.Mock).mockResolvedValue(0);
        (prismaCourseEditorWritePort.setCourseActive as jest.Mock).mockResolvedValue(true);
        (prismaCourseEditorWritePort.setClassVideo as jest.Mock).mockResolvedValue(true);
        await expect(activateCourse(1)).resolves.toMatchObject({ success: true });
        await expect(deactivateCourse(1)).resolves.toMatchObject({ success: true });
        await expect(updateClassVideoPath(2, 'https://example.com/video.mp4', 3)).resolves.toBe(true);
    });
});
