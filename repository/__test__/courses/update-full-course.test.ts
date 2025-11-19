import { updateFullCourse } from '../../courses';
import { prisma } from '../../../lib/prisma';
import { storeVideoBlobStorage } from '../../../services/video';
import { del } from '@vercel/blob';
import { mergeChangesByTypeAndId } from '../../../utils/classes';
import { setupMocks, clearAllMocks } from './setup';

jest.mock('../../../lib/prisma', () => ({
    __esModule: true,
    prisma: {
        $transaction: jest.fn(),
        course: {
            update: jest.fn(),
        },
        moduleClass: {
            findMany: jest.fn(),
        },
    },
}));

jest.mock('../../../services/video', () => ({
    storeVideoBlobStorage: jest.fn(),
}));

jest.mock('@vercel/blob', () => ({
    del: jest.fn(),
}));

jest.mock('../../../utils/classes', () => ({
    mergeChangesByTypeAndId: jest.fn(),
    toSnakeCase: jest.fn((str: string) => str.toLowerCase().replace(/\s+/g, '-')),
}));

// Mock updateCourse function
jest.mock('../../courses', () => {
    const actual = jest.requireActual('../../courses');
    return {
        ...actual,
        updateCourse: jest.fn(),
    };
});

describe('repository/courses - updateFullCourse', () => {
    let mockTransaction: any;

    beforeEach(() => {
        setupMocks();
        
        // Setup transaction mock
        mockTransaction = {
            course: {
                update: jest.fn(),
                delete: jest.fn(),
            },
            courseModules: {
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
            moduleClass: {
                create: jest.fn(),
                findFirst: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
            moduleQuiz: {
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
            quizQuestion: {
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
            possibleAnswerQuestion: {
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
        };

        (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
            return await callback(mockTransaction);
        });

        (mergeChangesByTypeAndId as jest.Mock).mockReturnValue({});
        (storeVideoBlobStorage as jest.Mock).mockResolvedValue('https://example.com/video.mp4');
        (del as jest.Mock).mockResolvedValue(undefined);
        (prisma.course.update as jest.Mock).mockResolvedValue({});
    });

    afterEach(() => {
        clearAllMocks();
    });

    describe('Add Operations', () => {
        it('should add a new question with options', async () => {
            const courseId = 1;
            const adds: any = [
                {
                    type: 'question',
                    action: 'added',
                    path: { course: 1, module: 1, quiz: 1 },
                    data: {
                        title: 'New Question',
                        type: 'MULTIPLE_CHOICE',
                        points: 10,
                        options: [
                            { value: 'Option 1', isCorrect: true },
                            { value: 'Option 2', isCorrect: false },
                        ],
                    },
                },
            ];

            mockTransaction.quizQuestion.create.mockResolvedValue({ id: 1 });
            mockTransaction.possibleAnswerQuestion.create.mockResolvedValue({ id: 1 });

            await updateFullCourse(courseId, adds, [], []);

            expect(mockTransaction.quizQuestion.create).toHaveBeenCalledWith({
                data: {
                    title: 'New Question',
                    quizId: 1,
                    type: 'MULTIPLE_CHOICE',
                    points: 10,
                },
            });
            expect(mockTransaction.possibleAnswerQuestion.create).toHaveBeenCalledTimes(2);
        });

        it('should add a new option to an existing question', async () => {
            const courseId = 1;
            const adds: any = [
                {
                    type: 'option',
                    action: 'added',
                    path: { course: 1, module: 1, quiz: 1, question: 1 },
                    data: {
                        value: 'New Option',
                        isCorrect: false,
                    },
                },
            ];

            mockTransaction.possibleAnswerQuestion.create.mockResolvedValue({ id: 1 });

            await updateFullCourse(courseId, adds, [], []);

            expect(mockTransaction.possibleAnswerQuestion.create).toHaveBeenCalledWith({
                data: {
                    questionId: 1,
                    value: 'New Option',
                    isCorrect: false,
                },
            });
        });

        it('should add a new class to an existing module', async () => {
            const courseId = 1;
            const adds: any = [
                {
                    type: 'class',
                    action: 'added',
                    path: { course: 1, module: 1 },
                    data: {
                        title: 'New Class',
                        description: 'Class description',
                        video: 'video.mp4',
                        videoDuration: 300,
                        videoSize: 1024,
                    },
                },
            ];

            mockTransaction.moduleClass.create.mockResolvedValue({ id: 1 });

            await updateFullCourse(courseId, adds, [], []);

            expect(mockTransaction.moduleClass.create).toHaveBeenCalledWith({
                data: {
                    title: 'New Class',
                    description: 'Class description',
                    courseModuleId: 1,
                    videoPath: 'video.mp4',
                    videoDuration: 300,
                    videoSize: 1024,
                },
            });
        });

        it('should add a new module with classes and quiz', async () => {
            const courseId = 1;
            const adds: any = [
                {
                    type: 'module',
                    action: 'added',
                    path: { course: 1 },
                    data: {
                        title: 'New Module',
                        minRequiredPoints: 70,
                        classes: [
                            {
                                title: 'Class 1',
                                description: 'Description',
                                video: 'video1.mp4',
                                videoDuration: 300,
                                videoSize: 1024,
                            },
                        ],
                        quiz: {
                            title: 'Module Quiz',
                            description: 'Quiz description',
                            questions: [
                                {
                                    title: 'Question 1',
                                    type: 'MULTIPLE_CHOICE',
                                    points: 10,
                                    options: [
                                        { value: 'Option 1', isCorrect: true },
                                    ],
                                },
                            ],
                        },
                    },
                },
            ];

            mockTransaction.courseModules.create.mockResolvedValue({ id: 1 });
            mockTransaction.moduleClass.create.mockResolvedValue({ id: 1 });
            mockTransaction.moduleQuiz.create.mockResolvedValue({ id: 1 });
            mockTransaction.quizQuestion.create.mockResolvedValue({ id: 1 });
            mockTransaction.possibleAnswerQuestion.create.mockResolvedValue({ id: 1 });

            await updateFullCourse(courseId, adds, [], []);

            expect(mockTransaction.courseModules.create).toHaveBeenCalledWith({
                data: {
                    courseId: 1,
                    title: 'New Module',
                    minRequiredPoints: 70,
                },
            });
            expect(mockTransaction.moduleClass.create).toHaveBeenCalled();
            expect(mockTransaction.moduleQuiz.create).toHaveBeenCalled();
            expect(mockTransaction.quizQuestion.create).toHaveBeenCalled();
            expect(mockTransaction.possibleAnswerQuestion.create).toHaveBeenCalled();
        });
    });

    describe('Update Operations', () => {
        it('should update course data', async () => {
            const courseId = 1;
            const updates: any = [
                {
                    type: 'course',
                    action: 'updated',
                    path: { course: 1 },
                    data: {
                        name: 'Updated Course',
                        description: 'Updated description',
                    },
                },
            ];

            (mergeChangesByTypeAndId as jest.Mock).mockReturnValue({
                course: {
                    '1': {
                        name: 'Updated Course',
                        description: 'Updated description',
                    },
                },
            });

            await updateFullCourse(courseId, [], updates, []);

            expect(mockTransaction.course.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: {
                    name: 'Updated Course',
                    description: 'Updated description',
                },
            });
        });

        it('should handle price conversion in updates', async () => {
            const courseId = 1;
            const updates: any = [
                {
                    type: 'course',
                    action: 'updated',
                    path: { course: 1 },
                    data: {
                        price: '99.99',
                    },
                },
            ];

            (mergeChangesByTypeAndId as jest.Mock).mockReturnValue({
                course: {
                    '1': {
                        price: '99.99',
                    },
                },
            });

            await updateFullCourse(courseId, [], updates, []);

            expect(mockTransaction.course.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: {
                    price: 99.99,
                },
            });
        });

        it('should handle date conversion for expiresAt', async () => {
            const courseId = 1;
            const dateString = '2025-12-31';
            const updates: any = [
                {
                    type: 'course',
                    action: 'updated',
                    path: { course: 1 },
                    data: {
                        expiresAt: dateString,
                    },
                },
            ];

            (mergeChangesByTypeAndId as jest.Mock).mockReturnValue({
                course: {
                    '1': {
                        expiresAt: dateString,
                    },
                },
            });

            await updateFullCourse(courseId, [], updates, []);

            expect(mockTransaction.course.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: {
                    expiresAt: new Date(dateString),
                },
            });
        });

        it('should extract courseImage for later upload', async () => {
            const courseId = 1;
            const mockFile = new File([''], 'image.jpg');
            const updates: any = [
                {
                    type: 'course',
                    action: 'updated',
                    path: { course: 1 },
                    data: {
                        courseImage: mockFile,
                        name: 'Course',
                    },
                },
            ];

            (mergeChangesByTypeAndId as jest.Mock).mockReturnValue({
                course: {
                    '1': {
                        courseImage: mockFile,
                        name: 'Course',
                    },
                },
            });

            await updateFullCourse(courseId, [], updates, []);

            expect(storeVideoBlobStorage).toHaveBeenCalledWith(
                `/courses/${courseId}/`,
                mockFile
            );
            expect(prisma.course.update).toHaveBeenCalledWith({
                where: { id: courseId },
                data: {
                    courseImage: 'https://example.com/video.mp4',
                },
            });
        });

        it('should extract instructorPhoto for later upload', async () => {
            const courseId = 1;
            const mockFile = new File([''], 'photo.jpg');
            const updates: any = [
                {
                    type: 'course',
                    action: 'updated',
                    path: { course: 1 },
                    data: {
                        instructorPhoto: mockFile,
                        name: 'Course',
                    },
                },
            ];

            (mergeChangesByTypeAndId as jest.Mock).mockReturnValue({
                course: {
                    '1': {
                        instructorPhoto: mockFile,
                        name: 'Course',
                    },
                },
            });

            await updateFullCourse(courseId, [], updates, []);

            expect(storeVideoBlobStorage).toHaveBeenCalledWith(
                `/courses/${courseId}/`,
                mockFile
            );
            expect(prisma.course.update).toHaveBeenCalledWith({
                where: { id: courseId },
                data: {
                    instructorPhoto: 'https://example.com/video.mp4',
                },
            });
        });

        it('should handle video updates and mark for deletion', async () => {
            const courseId = 1;
            const classId = 5;
            const updates: any = [
                {
                    type: 'class',
                    action: 'updated',
                    path: { course: 1, module: 1, class: classId },
                    data: {
                        video: 'new-video.mp4',
                    },
                },
            ];

            (mergeChangesByTypeAndId as jest.Mock).mockReturnValue({
                class: {
                    [classId]: {
                        video: 'new-video.mp4',
                    },
                },
            });

            (prisma.moduleClass.findMany as jest.Mock).mockResolvedValue([
                { id: classId, videoPath: 'old-video.mp4' },
            ]);

            await updateFullCourse(courseId, [], updates, []);

            expect(prisma.moduleClass.findMany).toHaveBeenCalledWith({
                where: { id: { in: [classId] } },
                orderBy: { id: 'asc' },
            });
            expect(del).toHaveBeenCalledWith(['old-video.mp4']);
        });
    });

    describe('Delete Operations', () => {
        it('should delete course', async () => {
            const courseId = 1;
            const deletes: any = [
                {
                    type: 'course',
                    action: 'deleted',
                    path: { course: 1 },
                    data: {},
                },
            ];

            await updateFullCourse(courseId, [], [], deletes);

            expect(mockTransaction.course.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            });
        });

        it('should delete module', async () => {
            const courseId = 1;
            const deletes: any = [
                {
                    type: 'module',
                    action: 'deleted',
                    path: { course: 1, module: 2 },
                    data: {},
                },
            ];

            await updateFullCourse(courseId, [], [], deletes);

            expect(mockTransaction.courseModules.delete).toHaveBeenCalledWith({
                where: { id: 2 },
            });
        });

        it('should delete class and mark video for deletion', async () => {
            const courseId = 1;
            const deletes: any = [
                {
                    type: 'class',
                    action: 'deleted',
                    path: { course: 1, module: 1, class: 3 },
                    data: {},
                },
            ];

            mockTransaction.moduleClass.findFirst.mockResolvedValue({
                id: 3,
                videoPath: 'video-to-delete.mp4',
            });

            await updateFullCourse(courseId, [], [], deletes);

            expect(mockTransaction.moduleClass.findFirst).toHaveBeenCalledWith({
                where: { id: 3 },
            });
            expect(mockTransaction.moduleClass.delete).toHaveBeenCalledWith({
                where: { id: 3 },
            });
            expect(del).toHaveBeenCalledWith(['video-to-delete.mp4']);
        });

        it('should delete quiz', async () => {
            const courseId = 1;
            const deletes: any = [
                {
                    type: 'quiz',
                    action: 'deleted',
                    path: { course: 1, module: 1, quiz: 4 },
                    data: {},
                },
            ];

            await updateFullCourse(courseId, [], [], deletes);

            expect(mockTransaction.moduleQuiz.delete).toHaveBeenCalledWith({
                where: { id: 4 },
            });
        });

        it('should delete question', async () => {
            const courseId = 1;
            const deletes: any = [
                {
                    type: 'question',
                    action: 'deleted',
                    path: { course: 1, module: 1, quiz: 1, question: 5 },
                    data: {},
                },
            ];

            await updateFullCourse(courseId, [], [], deletes);

            expect(mockTransaction.quizQuestion.delete).toHaveBeenCalledWith({
                where: { id: 5 },
            });
        });

        it('should delete option', async () => {
            const courseId = 1;
            const deletes: any = [
                {
                    type: 'option',
                    action: 'deleted',
                    path: { course: 1, module: 1, quiz: 1, question: 1, option: 6 },
                    data: {},
                },
            ];

            await updateFullCourse(courseId, [], [], deletes);

            expect(mockTransaction.possibleAnswerQuestion.delete).toHaveBeenCalledWith({
                where: { id: 6 },
            });
        });
    });

    describe('Complex Scenarios', () => {
        it('should handle mixed operations (add, update, delete)', async () => {
            const courseId = 1;
            const adds: any = [
                {
                    type: 'option',
                    action: 'added',
                    path: { course: 1, module: 1, quiz: 1, question: 1 },
                    data: { value: 'New Option', isCorrect: false },
                },
            ];
            const updates: any = [
                {
                    type: 'course',
                    action: 'updated',
                    path: { course: 1 },
                    data: { name: 'Updated Course' },
                },
            ];
            const deletes: any = [
                {
                    type: 'class',
                    action: 'deleted',
                    path: { course: 1, module: 1, class: 3 },
                    data: {},
                },
            ];

            (mergeChangesByTypeAndId as jest.Mock).mockReturnValue({
                course: { '1': { name: 'Updated Course' } },
            });

            mockTransaction.possibleAnswerQuestion.create.mockResolvedValue({ id: 1 });
            mockTransaction.moduleClass.findFirst.mockResolvedValue({
                id: 3,
                videoPath: 'video.mp4',
            });

            await updateFullCourse(courseId, adds, updates, deletes);

            expect(mockTransaction.possibleAnswerQuestion.create).toHaveBeenCalled();
            expect(mockTransaction.course.update).toHaveBeenCalled();
            expect(mockTransaction.moduleClass.delete).toHaveBeenCalled();
        });

        it('should handle transaction rollback on error', async () => {
            const courseId = 1;
            const adds: any = [
                {
                    type: 'question',
                    action: 'added',
                    path: { course: 1, module: 1, quiz: 1 },
                    data: {
                        title: 'Question',
                        type: 'MULTIPLE_CHOICE',
                        points: 10,
                    },
                },
            ];

            mockTransaction.quizQuestion.create.mockRejectedValue(
                new Error('Database error')
            );

            await expect(updateFullCourse(courseId, adds, [], [])).rejects.toThrow(
                'Database error'
            );
        });

        it('should handle blob storage deletion errors gracefully', async () => {
            const courseId = 1;
            const deletes: any = [
                {
                    type: 'class',
                    action: 'deleted',
                    path: { course: 1, module: 1, class: 3 },
                    data: {},
                },
            ];

            mockTransaction.moduleClass.findFirst.mockResolvedValue({
                id: 3,
                videoPath: 'video.mp4',
            });

            (del as jest.Mock).mockRejectedValue(new Error('Blob deletion error'));

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            await updateFullCourse(courseId, [], [], deletes);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error deleting videos from blob storage:',
                expect.any(Error)
            );

            consoleErrorSpy.mockRestore();
        });

        it('should not delete videos if no videos to delete', async () => {
            const courseId = 1;
            const updates: any = [
                {
                    type: 'course',
                    action: 'updated',
                    path: { course: 1 },
                    data: { name: 'Updated' },
                },
            ];

            (mergeChangesByTypeAndId as jest.Mock).mockReturnValue({
                course: { '1': { name: 'Updated' } },
            });

            await updateFullCourse(courseId, [], updates, []);

            expect(del).not.toHaveBeenCalled();
        });
    });
});
