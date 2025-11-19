import { updateCourse, updateModule, updateClass, updateQuiz, updateQuestion, updateOption } from '../../courses';
import { Course } from '../../../models/course';
import { CourseModules } from '../../../models/course-modules';
import { ModuleClass } from '../../../models/module-class';
import { ModuleQuiz } from '../../../models/module-quiz';
import { QuizQuestion } from '../../../models/quiz-question';
import { PossibleAnswerQuestion } from '../../../models/possible-answer-question';
import { prisma } from '../../../lib/prisma';
import { setupMocks, clearAllMocks } from './setup';

jest.mock('../../../lib/prisma', () => ({
    __esModule: true,
    prisma: {
        course: {
            update: jest.fn(),
        },
        courseModules: {
            update: jest.fn(),
        },
        moduleClass: {
            update: jest.fn(),
        },
        moduleQuiz: {
            update: jest.fn(),
        },
        quizQuestion: {
            update: jest.fn(),
        },
        possibleAnswerQuestion: {
            update: jest.fn(),
        },
    },
}));

jest.mock('../../../models/course');
jest.mock('../../../models/course-modules');
jest.mock('../../../models/module-class');
jest.mock('../../../models/module-quiz');
jest.mock('../../../models/quiz-question');
jest.mock('../../../models/possible-answer-question');

describe('repository/courses - Update Functions', () => {
    beforeEach(() => {
        setupMocks();
    });

    afterEach(() => {
        clearAllMocks();
    });

    describe('updateCourse', () => {
        it('should update course with provided data', async () => {
            const courseId = 1;
            const updateData = {
                name: 'Updated Course',
                description: 'Updated description',
                price: 99.99,
            };
            const mockUpdatedCourse = {
                id: courseId,
                name: 'Updated Course',
                description: 'Updated description',
                price: 99.99,
                canonicalId: 'test-course',
                imageUrl: 'image.jpg',
                instructorId: 1,
                isActive: true,
                deletedAt: null,
            };

            (prisma.course.update as jest.Mock).mockResolvedValue(mockUpdatedCourse);
            (Course as jest.MockedClass<typeof Course>).mockImplementation((data: any) => data as any);

            const result = await updateCourse(courseId, updateData);

            expect(prisma.course.update).toHaveBeenCalledWith({
                where: { id: courseId },
                data: updateData,
            });
            expect(result).toEqual(mockUpdatedCourse);
        });

        it('should exclude nested relations from update data', async () => {
            const courseId = 1;
            const updateData = {
                name: 'Updated Course',
                category: { id: 1, name: 'Category' }, // Should be excluded
                courseModules: [], // Should be excluded
                cart: [], // Should be excluded
                userCourse: [], // Should be excluded
            };
            const mockUpdatedCourse = {
                id: courseId,
                name: 'Updated Course',
                canonicalId: 'test-course',
                imageUrl: 'image.jpg',
                instructorId: 1,
                isActive: true,
                deletedAt: null,
            };

            (prisma.course.update as jest.Mock).mockResolvedValue(mockUpdatedCourse);
            (Course as jest.MockedClass<typeof Course>).mockImplementation((data: any) => data as any);

            const result = await updateCourse(courseId, updateData as any);

            expect(prisma.course.update).toHaveBeenCalledWith({
                where: { id: courseId },
                data: { name: 'Updated Course' }, // Only name should be passed
            });
            expect(result).toEqual(mockUpdatedCourse);
        });

        it('should return Course model instance', async () => {
            const courseId = 1;
            const updateData = { name: 'Updated Course' } as any;
            const mockUpdatedCourse = {
                id: courseId,
                name: 'Updated Course',
                canonicalId: 'test-course',
                imageUrl: 'image.jpg',
                instructorId: 1,
                isActive: true,
                deletedAt: null,
            };

            (prisma.course.update as jest.Mock).mockResolvedValue(mockUpdatedCourse);
            (Course as jest.MockedClass<typeof Course>).mockImplementation((data: any) => data as any);

            const result = await updateCourse(courseId, updateData);

            expect(Course).toHaveBeenCalledWith(mockUpdatedCourse);
            expect(result).toBeInstanceOf(Object);
        });
    });

    describe('updateModule', () => {
        it('should update module with provided data', async () => {
            const moduleId = 1;
            const updateData = {
                title: 'Updated Module',
                description: 'Updated description',
                order: 2,
            };
            const mockUpdatedModule = {
                id: moduleId,
                title: 'Updated Module',
                description: 'Updated description',
                order: 2,
                courseId: 1,
                deletedAt: null,
            };

            (prisma.courseModules.update as jest.Mock).mockResolvedValue(mockUpdatedModule);
            (CourseModules as jest.MockedClass<typeof CourseModules>).mockImplementation((data: any) => data as any);

            const result = await updateModule(moduleId, updateData);

            expect(prisma.courseModules.update).toHaveBeenCalledWith({
                where: { id: moduleId },
                data: updateData,
            });
            expect(result).toEqual(mockUpdatedModule);
        });

        it('should exclude nested relations from update data', async () => {
            const moduleId = 1;
            const updateData = {
                title: 'Updated Module',
                moduleClass: [], // Should be excluded
                moduleQuiz: {}, // Should be excluded
            };
            const mockUpdatedModule = {
                id: moduleId,
                title: 'Updated Module',
                courseId: 1,
                deletedAt: null,
            };

            (prisma.courseModules.update as jest.Mock).mockResolvedValue(mockUpdatedModule);
            (CourseModules as jest.MockedClass<typeof CourseModules>).mockImplementation((data: any) => data as any);

            const result = await updateModule(moduleId, updateData as any);

            expect(prisma.courseModules.update).toHaveBeenCalledWith({
                where: { id: moduleId },
                data: { title: 'Updated Module' }, // Only title should be passed
            });
            expect(result).toEqual(mockUpdatedModule);
        });

        it('should return CourseModules model instance', async () => {
            const moduleId = 1;
            const updateData = { title: 'Updated Module' };
            const mockUpdatedModule = {
                id: moduleId,
                title: 'Updated Module',
                courseId: 1,
                deletedAt: null,
            };

            (prisma.courseModules.update as jest.Mock).mockResolvedValue(mockUpdatedModule);
            (CourseModules as jest.MockedClass<typeof CourseModules>).mockImplementation((data: any) => data as any);

            const result = await updateModule(moduleId, updateData);

            expect(CourseModules).toHaveBeenCalledWith(mockUpdatedModule);
            expect(result).toBeInstanceOf(Object);
        });
    });

    describe('updateClass', () => {
        it('should update class with provided data', async () => {
            const classId = 1;
            const updateData = {
                title: 'Updated Class',
                description: 'Updated description',
                videoPath: 'new-video.mp4',
                videoDuration: 600,
            };
            const mockUpdatedClass = {
                id: classId,
                title: 'Updated Class',
                description: 'Updated description',
                videoPath: 'new-video.mp4',
                videoDuration: 600,
                videoSize: 1024,
                courseModuleId: 1,
                deletedAt: null,
            };

            (prisma.moduleClass.update as jest.Mock).mockResolvedValue(mockUpdatedClass);
            (ModuleClass as jest.MockedClass<typeof ModuleClass>).mockImplementation((data: any) => data as any);

            const result = await updateClass(classId, updateData);

            expect(prisma.moduleClass.update).toHaveBeenCalledWith({
                where: { id: classId },
                data: updateData,
            });
            expect(result).toEqual(mockUpdatedClass);
        });

        it('should update only specified fields', async () => {
            const classId = 1;
            const updateData = { title: 'Updated Class Only' };
            const mockUpdatedClass = {
                id: classId,
                title: 'Updated Class Only',
                description: 'Original description',
                videoPath: 'original.mp4',
                videoDuration: 300,
                videoSize: 512,
                courseModuleId: 1,
                deletedAt: null,
            };

            (prisma.moduleClass.update as jest.Mock).mockResolvedValue(mockUpdatedClass);
            (ModuleClass as jest.MockedClass<typeof ModuleClass>).mockImplementation((data: any) => data as any);

            const result = await updateClass(classId, updateData);

            expect(prisma.moduleClass.update).toHaveBeenCalledWith({
                where: { id: classId },
                data: updateData,
            });
            expect(result).toEqual(mockUpdatedClass);
        });

        it('should return ModuleClass model instance', async () => {
            const classId = 1;
            const updateData = { title: 'Updated Class' };
            const mockUpdatedClass = {
                id: classId,
                title: 'Updated Class',
                courseModuleId: 1,
                deletedAt: null,
            };

            (prisma.moduleClass.update as jest.Mock).mockResolvedValue(mockUpdatedClass);
            (ModuleClass as jest.MockedClass<typeof ModuleClass>).mockImplementation((data: any) => data as any);

            const result = await updateClass(classId, updateData);

            expect(ModuleClass).toHaveBeenCalledWith(mockUpdatedClass);
            expect(result).toBeInstanceOf(Object);
        });
    });

    describe('updateQuiz', () => {
        it('should update quiz with provided data', async () => {
            const quizId = 1;
            const updateData = {
                title: 'Updated Quiz',
                description: 'Updated description',
            };
            const mockUpdatedQuiz = {
                id: quizId,
                title: 'Updated Quiz',
                description: 'Updated description',
                courseModuleId: 1,
                deletedAt: null,
            };

            (prisma.moduleQuiz.update as jest.Mock).mockResolvedValue(mockUpdatedQuiz);
            (ModuleQuiz as jest.MockedClass<typeof ModuleQuiz>).mockImplementation((data: any) => data as any);

            const result = await updateQuiz(quizId, updateData);

            expect(prisma.moduleQuiz.update).toHaveBeenCalledWith({
                where: { id: quizId },
                data: updateData,
            });
            expect(result).toEqual(mockUpdatedQuiz);
        });

        it('should exclude nested relations from update data', async () => {
            const quizId = 1;
            const updateData = {
                title: 'Updated Quiz',
                quizQuestion: [], // Should be excluded
                userQuizState: [], // Should be excluded
            };
            const mockUpdatedQuiz = {
                id: quizId,
                title: 'Updated Quiz',
                courseModuleId: 1,
                deletedAt: null,
            };

            (prisma.moduleQuiz.update as jest.Mock).mockResolvedValue(mockUpdatedQuiz);
            (ModuleQuiz as jest.MockedClass<typeof ModuleQuiz>).mockImplementation((data: any) => data as any);

            const result = await updateQuiz(quizId, updateData as any);

            expect(prisma.moduleQuiz.update).toHaveBeenCalledWith({
                where: { id: quizId },
                data: { title: 'Updated Quiz' }, // Only title should be passed
            });
            expect(result).toEqual(mockUpdatedQuiz);
        });

        it('should return ModuleQuiz model instance', async () => {
            const quizId = 1;
            const updateData = { title: 'Updated Quiz' };
            const mockUpdatedQuiz = {
                id: quizId,
                title: 'Updated Quiz',
                courseModuleId: 1,
                deletedAt: null,
            };

            (prisma.moduleQuiz.update as jest.Mock).mockResolvedValue(mockUpdatedQuiz);
            (ModuleQuiz as jest.MockedClass<typeof ModuleQuiz>).mockImplementation((data: any) => data as any);

            const result = await updateQuiz(quizId, updateData);

            expect(ModuleQuiz).toHaveBeenCalledWith(mockUpdatedQuiz);
            expect(result).toBeInstanceOf(Object);
        });
    });

    describe('updateQuestion', () => {
        it('should update question with provided data', async () => {
            const questionId = 1;
            const updateData = {
                title: 'Updated Question',
                type: 'TEXT' as const,
                points: 15,
            };
            const mockUpdatedQuestion = {
                id: questionId,
                title: 'Updated Question',
                type: 'TEXT',
                points: 15,
                quizId: 1,
                deletedAt: null,
            };

            (prisma.quizQuestion.update as jest.Mock).mockResolvedValue(mockUpdatedQuestion);
            (QuizQuestion as jest.MockedClass<typeof QuizQuestion>).mockImplementation((data: any) => data as any);

            const result = await updateQuestion(questionId, updateData);

            expect(prisma.quizQuestion.update).toHaveBeenCalledWith({
                where: { id: questionId },
                data: updateData,
            });
            expect(result).toEqual(mockUpdatedQuestion);
        });

        it('should exclude nested relations from update data', async () => {
            const questionId = 1;
            const updateData = {
                title: 'Updated Question',
                possibleAnswerQuestion: [], // Should be excluded
            };
            const mockUpdatedQuestion = {
                id: questionId,
                title: 'Updated Question',
                type: 'MULTIPLE_CHOICE',
                points: 10,
                quizId: 1,
                deletedAt: null,
            };

            (prisma.quizQuestion.update as jest.Mock).mockResolvedValue(mockUpdatedQuestion);
            (QuizQuestion as jest.MockedClass<typeof QuizQuestion>).mockImplementation((data: any) => data as any);

            const result = await updateQuestion(questionId, updateData as any);

            expect(prisma.quizQuestion.update).toHaveBeenCalledWith({
                where: { id: questionId },
                data: { title: 'Updated Question' }, // Only title should be passed
            });
            expect(result).toEqual(mockUpdatedQuestion);
        });

        it('should return QuizQuestion model instance', async () => {
            const questionId = 1;
            const updateData = { title: 'Updated Question' };
            const mockUpdatedQuestion = {
                id: questionId,
                title: 'Updated Question',
                type: 'MULTIPLE_CHOICE',
                points: 10,
                quizId: 1,
                deletedAt: null,
            };

            (prisma.quizQuestion.update as jest.Mock).mockResolvedValue(mockUpdatedQuestion);
            (QuizQuestion as jest.MockedClass<typeof QuizQuestion>).mockImplementation((data: any) => data as any);

            const result = await updateQuestion(questionId, updateData);

            expect(QuizQuestion).toHaveBeenCalledWith(mockUpdatedQuestion);
            expect(result).toBeInstanceOf(Object);
        });
    });

    describe('updateOption', () => {
        it('should update option with provided data', async () => {
            const optionId = 1;
            const updateData = {
                value: 'Updated Option',
                isCorrect: true,
            };
            const mockUpdatedOption = {
                id: optionId,
                value: 'Updated Option',
                isCorrect: true,
                questionId: 1,
                deletedAt: null,
            };

            (prisma.possibleAnswerQuestion.update as jest.Mock).mockResolvedValue(mockUpdatedOption);
            (PossibleAnswerQuestion as jest.MockedClass<typeof PossibleAnswerQuestion>).mockImplementation((data: any) => data as any);

            const result = await updateOption(optionId, updateData);

            expect(prisma.possibleAnswerQuestion.update).toHaveBeenCalledWith({
                where: { id: optionId },
                data: updateData,
            });
            expect(result).toEqual(mockUpdatedOption);
        });

        it('should update correctness flag', async () => {
            const optionId = 1;
            const updateData = { isCorrect: false };
            const mockUpdatedOption = {
                id: optionId,
                value: 'Original Option',
                isCorrect: false,
                questionId: 1,
                deletedAt: null,
            };

            (prisma.possibleAnswerQuestion.update as jest.Mock).mockResolvedValue(mockUpdatedOption);
            (PossibleAnswerQuestion as jest.MockedClass<typeof PossibleAnswerQuestion>).mockImplementation((data: any) => data as any);

            const result = await updateOption(optionId, updateData);

            expect(prisma.possibleAnswerQuestion.update).toHaveBeenCalledWith({
                where: { id: optionId },
                data: updateData,
            });
            expect(result.isCorrect).toBe(false);
        });

        it('should return PossibleAnswerQuestion model instance', async () => {
            const optionId = 1;
            const updateData = { value: 'Updated Option' };
            const mockUpdatedOption = {
                id: optionId,
                value: 'Updated Option',
                isCorrect: true,
                questionId: 1,
                deletedAt: null,
            };

            (prisma.possibleAnswerQuestion.update as jest.Mock).mockResolvedValue(mockUpdatedOption);
            (PossibleAnswerQuestion as jest.MockedClass<typeof PossibleAnswerQuestion>).mockImplementation((data: any) => data as any);

            const result = await updateOption(optionId, updateData);

            expect(PossibleAnswerQuestion).toHaveBeenCalledWith(mockUpdatedOption);
            expect(result).toBeInstanceOf(Object);
        });
    });
});
