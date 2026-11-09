import { prismaCourseEditorWritePort } from '@/repository/course-editor.prisma';
import { prisma } from '@/lib/prisma';
import { toSnakeCase } from '@/shared/text/snake-case';
import type { CourseEditorPatch, CreateCourseCommand } from '@/application/courses/course-editor.commands';

jest.mock('@/lib/prisma', () => ({
    prisma: {
        $transaction: jest.fn(),
        course: { update: jest.fn(), findUnique: jest.fn() },
        moduleClass: { update: jest.fn() },
        courseAssetCleanup: { createMany: jest.fn() },
    },
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
            data: [expect.objectContaining({ position: 0, videoPath: 'https://example.com/class.mp4' })],
        });
        expect(tx.courseModules.create).toHaveBeenCalledWith({ data: expect.objectContaining({ position: 0 }) });
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
        const tx = {
            course: {
                findUnique: jest.fn().mockResolvedValue({
                    ...command, id: 7, deleted: false, isActive: false,
                    courseModules: [{ title: 'Fundamentos', minRequiredPoints: 10,
                        moduleClass: [{ title: 'Introducción', description: 'Clase', videoPath: 'https://example.com/old.mp4' }],
                        moduleQuiz: [{ title: 'Quiz', description: 'Evaluación', quizQuestion: [{ title: 'Pregunta', points: 10, type: 'multiple', possibleAnswerQuestion: [
                            { value: 'Sí', isCorrect: true }, { value: 'No', isCorrect: false },
                        ] }] }],
                    }],
                }),
                count: jest.fn().mockResolvedValue(0),
                update: jest.fn().mockResolvedValue({ id: 7 }),
            },
            moduleClass: {
                findUnique: jest.fn().mockResolvedValue({ videoPath: 'https://example.com/old.mp4', courseModule: { courseId: 7 } }),
                update: jest.fn().mockResolvedValue({ id: 8 }),
            },
        };
        (prisma.$transaction as jest.Mock).mockImplementation((callback) => callback(tx));

        await expect(prismaCourseEditorWritePort.setCourseActive(7, true)).resolves.toBe(true);
        await expect(prismaCourseEditorWritePort.setClassVideo(8, 'https://example.com/video.mp4', 100)).resolves.toBe(true);

        expect(tx.course.update).toHaveBeenCalledWith({ where: { id: 7 }, data: { isActive: true } });
        expect(tx.moduleClass.update).toHaveBeenCalledWith({
            where: { id: 8 }, data: { videoPath: 'https://example.com/video.mp4', videoSize: 100 },
        });
    });

    it('does not activate a draft without modules', async () => {
        const tx = {
            course: {
                findUnique: jest.fn().mockResolvedValue({
                    ...command, id: 7, deleted: false, isActive: false, courseModules: [],
                }),
                count: jest.fn(), update: jest.fn(),
            },
        };
        (prisma.$transaction as jest.Mock).mockImplementation((callback) => callback(tx));

        await expect(prismaCourseEditorWritePort.setCourseActive(7, true)).resolves.toBe(false);
        expect(tx.course.update).not.toHaveBeenCalled();
        expect(tx.course.count).not.toHaveBeenCalled();
    });

    it('creates a basic inactive draft without modules or uploaded images', async () => {
        const basics = { ...command, courseImage: '', instructorPhoto: '' };
        const create = jest.fn().mockResolvedValue({ id: 7 });
        (prisma.course as unknown as { create: jest.Mock }).create = create;
        (toSnakeCase as jest.Mock).mockReturnValue('typescript-avanzado');

        await expect(prismaCourseEditorWritePort.createDraft(basics)).resolves.toBe(7);
        expect(create).toHaveBeenCalledWith({ data: expect.objectContaining({
            title: command.title, courseImage: '', instructorPhoto: '', isActive: false,
        }) });
    });

    it('reuses the same draft when creation is retried with an idempotency key', async () => {
        const upsert = jest.fn().mockResolvedValue({ id: 7 });
        (prisma.course as unknown as { upsert: jest.Mock }).upsert = upsert;
        (toSnakeCase as jest.Mock).mockReturnValue('typescript-avanzado');
        const basics = { ...command, draftKey: 'e1e55419-6c99-49eb-af38-92dd7b746364' };

        await expect(prismaCourseEditorWritePort.createDraft(basics)).resolves.toBe(7);
        expect(upsert).toHaveBeenCalledWith({
            where: { draftKey: basics.draftKey },
            create: expect.objectContaining({ draftKey: basics.draftKey, isActive: false }),
            update: {},
        });
    });

    it('schedules the previous managed image only after updating the basic fields', async () => {
        const oldUrl = 'https://store.public.blob.vercel-storage.com/courses/7/old.png';
        const tx = {
            course: {
                findUnique: jest.fn().mockResolvedValue({ courseImage: oldUrl, instructorPhoto: '' }),
                update: jest.fn(),
            },
            courseAssetCleanup: { createMany: jest.fn() },
        };
        (prisma.$transaction as jest.Mock).mockImplementation((callback) => callback(tx));

        await prismaCourseEditorWritePort.updateBasics(7, command);

        expect(tx.course.update).toHaveBeenCalledWith({ where: { id: 7 }, data: expect.objectContaining({ courseImage: command.courseImage }) });
        expect(tx.courseAssetCleanup.createMany).toHaveBeenCalledWith({
            data: [{ courseId: 7, url: oldUrl }], skipDuplicates: true,
        });
    });

    it('writes only the requested text field without touching assets or expiration', async () => {
        await prismaCourseEditorWritePort.updateBasics(7, { title: 'Nuevo título' });

        expect(prisma.course.update).toHaveBeenCalledWith({ where: { id: 7 }, data: { title: 'Nuevo título' } });
        expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('does not issue any database write for an empty patch', async () => {
        await prismaCourseEditorWritePort.updateBasics(7, {});

        expect(prisma.course.update).not.toHaveBeenCalled();
        expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('replaces only the selected image and queues only its previous URL', async () => {
        const oldImage = 'https://store.public.blob.vercel-storage.com/courses/7/old.png';
        const oldInstructor = 'https://store.public.blob.vercel-storage.com/courses/7/instructor.png';
        const tx = {
            course: {
                findUnique: jest.fn().mockResolvedValue({ courseImage: oldImage, instructorPhoto: oldInstructor }),
                update: jest.fn(),
            },
            courseAssetCleanup: { createMany: jest.fn() },
        };
        (prisma.$transaction as jest.Mock).mockImplementation((callback) => callback(tx));

        await prismaCourseEditorWritePort.updateBasics(7, { courseImage: 'https://example.com/new.png' });

        expect(tx.course.update).toHaveBeenCalledWith({ where: { id: 7 }, data: { courseImage: 'https://example.com/new.png' } });
        expect(tx.courseAssetCleanup.createMany).toHaveBeenCalledWith({
            data: [{ courseId: 7, url: oldImage }], skipDuplicates: true,
        });
    });

    it('saves content with explicit positions without replacing basic information', async () => {
        const videoUrl = 'https://store.public.blob.vercel-storage.com/courses/7/class.mp4';
        const tx = {
            course: {
                findUnique: jest.fn().mockResolvedValue({ id: 7, courseImage: '', instructorPhoto: '', courseModules: [] }),
                update: jest.fn(),
            },
            courseModules: { create: jest.fn().mockResolvedValue({ id: 8 }) },
            moduleClass: { create: jest.fn().mockResolvedValue({ id: 9 }) },
            moduleQuiz: { create: jest.fn().mockResolvedValue({ id: 10 }) },
            quizQuestion: { create: jest.fn().mockResolvedValue({ id: 11 }) },
            possibleAnswerQuestion: { create: jest.fn() },
            courseAssetCleanup: { deleteMany: jest.fn() },
        };
        (prisma.$transaction as jest.Mock).mockImplementation((callback) => callback(tx));
        const content: CourseEditorPatch = {
            ...command,
            modules: [{ ...command.modules[0], classes: [{ ...command.modules[0].classes[0], videoPath: videoUrl }], quiz: { ...command.modules[0].quiz,
                questions: [
                    { title: 'Explique', type: 'text', points: 1, expectedAnswer: { value: 'Respuesta' } },
                    { title: 'Seleccione', type: 'multiple', points: 1, options: [
                        { value: 'A', isCorrect: true }, { value: 'B', isCorrect: false },
                    ] },
                ],
            } }],
        };

        await prismaCourseEditorWritePort.saveContent(7, content);

        expect(tx.course.update).not.toHaveBeenCalled();
        expect(tx.courseModules.create).toHaveBeenCalledWith({ data: expect.objectContaining({
            position: 0,
            moduleClass: { create: [expect.objectContaining({ position: 0, videoPath: videoUrl })] },
            moduleQuiz: { create: expect.objectContaining({ quizQuestion: { create: [
                expect.objectContaining({ expectedAnswer: 'Respuesta' }),
                expect.objectContaining({ possibleAnswerQuestion: { create: [
                    { value: 'A', isCorrect: true }, { value: 'B', isCorrect: false },
                ] } }),
            ] } }) },
        }) });
        expect(tx.moduleClass.create).not.toHaveBeenCalled();
        expect(tx.quizQuestion.create).not.toHaveBeenCalled();
        expect(tx.courseAssetCleanup.deleteMany).toHaveBeenCalledWith({
            where: { courseId: 7, url: { in: [videoUrl] } },
        });
        expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), {
            isolationLevel: 'Serializable', timeout: 12_000,
        });
    });

    it('defers failed-upload cleanup long enough for safe URL reuse', async () => {
        const url = 'https://store.public.blob.vercel-storage.com/courses/7/retry.mp4';
        const imageUrl = 'https://store.public.blob.vercel-storage.com/courses/7/retry.png';
        (prisma.course.findUnique as jest.Mock).mockResolvedValue({ id: 7 });
        const startedAt = Date.now();

        await prismaCourseEditorWritePort.queueUnusedAssets(7, [url, imageUrl]);

        const data = (prisma.courseAssetCleanup.createMany as jest.Mock).mock.calls[0][0].data;
        expect(data[0]).toMatchObject({ courseId: 7, url });
        expect(data[0].availableAt.getTime()).toBeGreaterThanOrEqual(startedAt + 24 * 60 * 60_000);
        expect(data[1]).toMatchObject({ courseId: 7, url: imageUrl });
        expect(data[1].availableAt.getTime()).toBeGreaterThanOrEqual(startedAt + 5 * 60_000);
        expect(data[1].availableAt.getTime()).toBeLessThan(startedAt + 6 * 60_000);
    });

    it('queues a replaced video after the class points to the new URL', async () => {
        const oldUrl = 'https://store.public.blob.vercel-storage.com/courses/7/old.mp4';
        const tx = {
            moduleClass: {
                findUnique: jest.fn().mockResolvedValue({ videoPath: oldUrl, courseModule: { courseId: 7 } }),
                update: jest.fn(),
            },
            courseAssetCleanup: { createMany: jest.fn() },
        };
        (prisma.$transaction as jest.Mock).mockImplementation((callback) => callback(tx));

        await prismaCourseEditorWritePort.setClassVideo(8, 'https://example.com/new.mp4', 42);

        expect(tx.moduleClass.update).toHaveBeenCalledWith({
            where: { id: 8 }, data: { videoPath: 'https://example.com/new.mp4', videoSize: 42 },
        });
        expect(tx.courseAssetCleanup.createMany).toHaveBeenCalledWith({
            data: [{ courseId: 7, url: oldUrl }], skipDuplicates: true,
        });
        expect(tx.moduleClass.update.mock.invocationCallOrder[0]).toBeLessThan(tx.courseAssetCleanup.createMany.mock.invocationCallOrder[0]);
    });
});
