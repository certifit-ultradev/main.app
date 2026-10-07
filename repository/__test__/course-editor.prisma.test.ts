import { prismaCourseEditorWritePort } from '@/repository/course-editor.prisma';
import { prisma } from '@/lib/prisma';
import { toSnakeCase } from '@/shared/text/snake-case';
import type { CourseEditorPatch, CreateCourseCommand } from '@/application/courses/course-editor.commands';

jest.mock('@/lib/prisma', () => ({
    prisma: { $transaction: jest.fn(), course: { update: jest.fn() }, moduleClass: { update: jest.fn() } },
}));
jest.mock('@/shared/text/snake-case', () => ({ toSnakeCase: jest.fn() }));

const command: CreateCourseCommand = {
    title: 'TypeScript avanzado', description: 'Curso', price: 120, categoryId: 2,
    instructorName: 'Ada', courseImage: 'https://example.com/course.png',
    instructorPhoto: 'https://example.com/ada.png', expiresAt: new Date('2030-01-01T00:00:00.000Z'),
    modules: [{
        title: 'Fundamentos', minRequiredPoints: 10,
        classes: [{ title: 'Introducción', description: 'Clase', videoPath: 'https://example.com/class.mp4', videoSize: 10, videoDuration: 20 }],
        quiz: {
            title: 'Quiz', description: 'Evaluación',
            questions: [{
                title: 'Seleccione', type: 'multiple', points: 5,
                options: [{ value: 'A', isCorrect: true }, { value: 'B', isCorrect: false }],
            }],
        },
    }],
};

describe('prismaCourseEditorWritePort.createCourse', () => {
    beforeEach(() => jest.clearAllMocks());

    it('persists a complete aggregate using only durable asset URLs and explicit command fields', async () => {
        const tx = {
            course: { create: jest.fn().mockResolvedValue({ id: 7 }) },
            courseModules: { create: jest.fn().mockResolvedValue({ id: 8 }) },
            moduleClass: { createMany: jest.fn().mockResolvedValue({ count: 1 }) },
            moduleQuiz: { create: jest.fn().mockResolvedValue({ id: 9 }) },
            quizQuestion: { create: jest.fn().mockResolvedValue({ id: 10 }) },
            possibleAnswerQuestion: { createMany: jest.fn().mockResolvedValue({ count: 2 }) },
        };
        (prisma.$transaction as jest.Mock).mockImplementation((callback) => callback(tx));
        (toSnakeCase as jest.Mock).mockReturnValue('typescript-avanzado');

        await expect(prismaCourseEditorWritePort.createCourse(command)).resolves.toBe(7);

        expect(tx.course.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                canonicalId: 'typescript-avanzado', courseImage: command.courseImage,
                instructorPhoto: command.instructorPhoto, isActive: false,
            }),
        });
        expect(tx.moduleClass.createMany).toHaveBeenCalledWith({
            data: [expect.objectContaining({ videoPath: 'https://example.com/class.mp4' })],
        });
        expect(tx.possibleAnswerQuestion.createMany).toHaveBeenCalledWith({
            data: [
                { questionId: 10, value: 'A', isCorrect: true },
                { questionId: 10, value: 'B', isCorrect: false },
            ],
        });
    });

    it('stores text in the question column without creating a selectable option', async () => {
        const tx = {
            course: { create: jest.fn().mockResolvedValue({ id: 7 }) },
            courseModules: { create: jest.fn().mockResolvedValue({ id: 8 }) },
            moduleClass: { createMany: jest.fn() },
            moduleQuiz: { create: jest.fn().mockResolvedValue({ id: 9 }) },
            quizQuestion: { create: jest.fn().mockResolvedValue({ id: 10 }) },
            possibleAnswerQuestion: { createMany: jest.fn().mockResolvedValue({ count: 1 }) },
        };
        (prisma.$transaction as jest.Mock).mockImplementation((callback) => callback(tx));
        const textCommand: CreateCourseCommand = {
            ...command,
            modules: [{ ...command.modules[0], quiz: { ...command.modules[0].quiz, questions: [
                { title: 'Explique', type: 'text', points: 5, expectedAnswer: 'Respuesta' },
            ] } }],
        };

        await prismaCourseEditorWritePort.createCourse(textCommand);
        expect(tx.quizQuestion.create).toHaveBeenCalledWith({ data: {
            quizId: 9, title: 'Explique', type: 'text', points: 5, expectedAnswer: 'Respuesta',
        } });
        expect(tx.possibleAnswerQuestion.createMany).not.toHaveBeenCalled();
    });

    it.each([
        { existingType: 'text', oldOptionIds: [11] },
        { existingType: 'multiple', oldOptionIds: [11, 12] },
    ])('writes text after $existingType and preserves historical option references', async ({ existingType, oldOptionIds }) => {
        const tx = {
            course: {
                findUnique: jest.fn().mockResolvedValue({ id: 7, courseModules: [{
                    id: 8, moduleClass: [], moduleQuiz: [{ id: 9, quizQuestion: [{
                        id: 10, type: existingType, possibleAnswerQuestion: oldOptionIds.map((id) => ({ id })),
                    }] }],
                }] }),
                update: jest.fn(),
            },
            courseModules: { update: jest.fn().mockResolvedValue({ id: 8 }), delete: jest.fn() },
            moduleQuiz: { update: jest.fn().mockResolvedValue({ id: 9 }) },
            quizQuestion: { update: jest.fn().mockResolvedValue({ id: 10 }), delete: jest.fn() },
            possibleAnswerQuestion: { updateMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
        };
        (prisma.$transaction as jest.Mock).mockImplementation((callback) => callback(tx));
        const patch: CourseEditorPatch = {
            ...command,
            modules: [{ id: 8, title: 'Fundamentos', minRequiredPoints: 10, classes: [], quiz: {
                id: 9, title: 'Quiz', description: 'Evaluación', questions: [
                    { id: 10, title: 'Explique', type: 'text', points: 5, expectedAnswer: { value: 'Nueva respuesta' } },
                ],
            } }],
        };

        await prismaCourseEditorWritePort.updateCourse(7, patch);

        expect(tx.quizQuestion.update).toHaveBeenCalledWith({
            where: { id: 10 },
            data: { title: 'Explique', type: 'text', points: 5, expectedAnswer: 'Nueva respuesta' },
        });
        expect(tx.possibleAnswerQuestion.updateMany).toHaveBeenCalledWith({
            where: { id: { in: oldOptionIds }, questionId: 10, deletedAt: null },
            data: { deletedAt: expect.any(Date) },
        });
        expect(tx.possibleAnswerQuestion.delete).not.toHaveBeenCalled();
        expect(tx.possibleAnswerQuestion.create).not.toHaveBeenCalled();
    });

    it('switches text to multiple with new option IDs while preserving historical references', async () => {
        const tx = {
            course: {
                findUnique: jest.fn().mockResolvedValue({ id: 7, courseModules: [{
                    id: 8, moduleClass: [], moduleQuiz: [{ id: 9, quizQuestion: [{
                        id: 10, type: 'text', possibleAnswerQuestion: [{ id: 11 }],
                    }] }],
                }] }),
                update: jest.fn(),
            },
            courseModules: { update: jest.fn().mockResolvedValue({ id: 8 }), delete: jest.fn() },
            moduleQuiz: { update: jest.fn().mockResolvedValue({ id: 9 }) },
            quizQuestion: { update: jest.fn().mockResolvedValue({ id: 10 }), delete: jest.fn() },
            possibleAnswerQuestion: { updateMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
        };
        (prisma.$transaction as jest.Mock).mockImplementation((callback) => callback(tx));
        const patch: CourseEditorPatch = {
            ...command,
            modules: [{ id: 8, title: 'Fundamentos', minRequiredPoints: 10, classes: [], quiz: {
                id: 9, title: 'Quiz', description: 'Evaluación', questions: [{
                    id: 10, title: 'Seleccione', type: 'multiple', points: 5,
                    options: [{ value: 'A', isCorrect: true }, { value: 'B', isCorrect: false }],
                }],
            } }],
        };

        await prismaCourseEditorWritePort.updateCourse(7, patch);
        expect(tx.quizQuestion.update).toHaveBeenCalledWith({ where: { id: 10 }, data: {
            title: 'Seleccione', type: 'multiple', points: 5, expectedAnswer: null,
        } });
        expect(tx.possibleAnswerQuestion.updateMany).toHaveBeenCalledWith({
            where: { id: { in: [11] }, questionId: 10, deletedAt: null }, data: { deletedAt: expect.any(Date) },
        });
        expect(tx.possibleAnswerQuestion.create).toHaveBeenCalledTimes(2);
        expect(tx.possibleAnswerQuestion.delete).not.toHaveBeenCalled();

        const reusedOption: CourseEditorPatch = {
            ...patch,
            modules: [{ ...patch.modules[0], quiz: { ...patch.modules[0].quiz, questions: [{
                id: 10, title: 'Seleccione', type: 'multiple', points: 5,
                options: [{ id: 11, value: 'A', isCorrect: true }, { value: 'B', isCorrect: false }],
            }] } }],
        };
        await expect(prismaCourseEditorWritePort.updateCourse(7, reusedOption)).rejects.toThrow('Opción inválida');

        const duplicateOption: CourseEditorPatch = {
            ...patch,
            modules: [{ ...patch.modules[0], quiz: { ...patch.modules[0].quiz, questions: [{
                id: 10, title: 'Seleccione', type: 'multiple', points: 5,
                options: [{ id: 11, value: 'A', isCorrect: true }, { id: 11, value: 'B', isCorrect: false }],
            }] } }],
        };
        await expect(prismaCourseEditorWritePort.updateCourse(7, duplicateOption)).rejects.toThrow('Opción duplicada');
    });

    it('updates activation and class-video fields through explicit primitive commands', async () => {
        (prisma.course.update as jest.Mock).mockResolvedValue({ id: 7 });
        (prisma.moduleClass.update as jest.Mock).mockResolvedValue({ id: 8 });

        await expect(prismaCourseEditorWritePort.setCourseActive(7, true)).resolves.toBe(true);
        await expect(prismaCourseEditorWritePort.setClassVideo(8, 'https://example.com/video.mp4', 100)).resolves.toBe(true);

        expect(prisma.course.update).toHaveBeenCalledWith({ where: { id: 7 }, data: { isActive: true } });
        expect(prisma.moduleClass.update).toHaveBeenCalledWith({
            where: { id: 8 }, data: { videoPath: 'https://example.com/video.mp4', videoSize: 100 },
        });
    });
});
