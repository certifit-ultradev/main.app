import { deleteCourse, deleteModule, deleteClass, deleteQuiz, deleteQuestion, deleteOption } from '../../courses';
import { prisma } from '../../../lib/prisma';
import { setupMocks, clearAllMocks } from './setup';

jest.mock('../../../lib/prisma', () => ({
    __esModule: true,
    prisma: {
        course: {
            delete: jest.fn(),
        },
        courseModules: {
            delete: jest.fn(),
        },
        moduleClass: {
            delete: jest.fn(),
        },
        moduleQuiz: {
            delete: jest.fn(),
        },
        quizQuestion: {
            delete: jest.fn(),
        },
        possibleAnswerQuestion: {
            delete: jest.fn(),
        },
    },
}));

describe('repository/courses - Delete Functions', () => {
    beforeEach(() => {
        setupMocks();
    });

    afterEach(() => {
        clearAllMocks();
    });

    describe('deleteCourse', () => {
        it('should delete course by id', async () => {
            const courseId = 1;
            (prisma.course.delete as jest.Mock).mockResolvedValue({});

            await deleteCourse(courseId);

            expect(prisma.course.delete).toHaveBeenCalledWith({
                where: { id: courseId },
            });
        });

        it('should not return any value', async () => {
            const courseId = 1;
            (prisma.course.delete as jest.Mock).mockResolvedValue({});

            const result = await deleteCourse(courseId);

            expect(result).toBeUndefined();
        });

        it('should handle different course ids', async () => {
            const courseId = 999;
            (prisma.course.delete as jest.Mock).mockResolvedValue({});

            await deleteCourse(courseId);

            expect(prisma.course.delete).toHaveBeenCalledWith({
                where: { id: 999 },
            });
        });
    });

    describe('deleteModule', () => {
        it('should delete module by id', async () => {
            const moduleId = 1;
            (prisma.courseModules.delete as jest.Mock).mockResolvedValue({});

            await deleteModule(moduleId);

            expect(prisma.courseModules.delete).toHaveBeenCalledWith({
                where: { id: moduleId },
            });
        });

        it('should not return any value', async () => {
            const moduleId = 1;
            (prisma.courseModules.delete as jest.Mock).mockResolvedValue({});

            const result = await deleteModule(moduleId);

            expect(result).toBeUndefined();
        });

        it('should handle different module ids', async () => {
            const moduleId = 42;
            (prisma.courseModules.delete as jest.Mock).mockResolvedValue({});

            await deleteModule(moduleId);

            expect(prisma.courseModules.delete).toHaveBeenCalledWith({
                where: { id: 42 },
            });
        });
    });

    describe('deleteClass', () => {
        it('should delete class by id', async () => {
            const classId = 1;
            (prisma.moduleClass.delete as jest.Mock).mockResolvedValue({});

            await deleteClass(classId);

            expect(prisma.moduleClass.delete).toHaveBeenCalledWith({
                where: { id: classId },
            });
        });

        it('should not return any value', async () => {
            const classId = 1;
            (prisma.moduleClass.delete as jest.Mock).mockResolvedValue({});

            const result = await deleteClass(classId);

            expect(result).toBeUndefined();
        });

        it('should handle different class ids', async () => {
            const classId = 123;
            (prisma.moduleClass.delete as jest.Mock).mockResolvedValue({});

            await deleteClass(classId);

            expect(prisma.moduleClass.delete).toHaveBeenCalledWith({
                where: { id: 123 },
            });
        });
    });

    describe('deleteQuiz', () => {
        it('should delete quiz by id', async () => {
            const quizId = 1;
            (prisma.moduleQuiz.delete as jest.Mock).mockResolvedValue({});

            await deleteQuiz(quizId);

            expect(prisma.moduleQuiz.delete).toHaveBeenCalledWith({
                where: { id: quizId },
            });
        });

        it('should not return any value', async () => {
            const quizId = 1;
            (prisma.moduleQuiz.delete as jest.Mock).mockResolvedValue({});

            const result = await deleteQuiz(quizId);

            expect(result).toBeUndefined();
        });

        it('should handle different quiz ids', async () => {
            const quizId = 55;
            (prisma.moduleQuiz.delete as jest.Mock).mockResolvedValue({});

            await deleteQuiz(quizId);

            expect(prisma.moduleQuiz.delete).toHaveBeenCalledWith({
                where: { id: 55 },
            });
        });
    });

    describe('deleteQuestion', () => {
        it('should delete question by id', async () => {
            const questionId = 1;
            (prisma.quizQuestion.delete as jest.Mock).mockResolvedValue({});

            await deleteQuestion(questionId);

            expect(prisma.quizQuestion.delete).toHaveBeenCalledWith({
                where: { id: questionId },
            });
        });

        it('should not return any value', async () => {
            const questionId = 1;
            (prisma.quizQuestion.delete as jest.Mock).mockResolvedValue({});

            const result = await deleteQuestion(questionId);

            expect(result).toBeUndefined();
        });

        it('should handle different question ids', async () => {
            const questionId = 77;
            (prisma.quizQuestion.delete as jest.Mock).mockResolvedValue({});

            await deleteQuestion(questionId);

            expect(prisma.quizQuestion.delete).toHaveBeenCalledWith({
                where: { id: 77 },
            });
        });
    });

    describe('deleteOption', () => {
        it('should delete option by id', async () => {
            const optionId = 1;
            (prisma.possibleAnswerQuestion.delete as jest.Mock).mockResolvedValue({});

            await deleteOption(optionId);

            expect(prisma.possibleAnswerQuestion.delete).toHaveBeenCalledWith({
                where: { id: optionId },
            });
        });

        it('should not return any value', async () => {
            const optionId = 1;
            (prisma.possibleAnswerQuestion.delete as jest.Mock).mockResolvedValue({});

            const result = await deleteOption(optionId);

            expect(result).toBeUndefined();
        });

        it('should handle different option ids', async () => {
            const optionId = 88;
            (prisma.possibleAnswerQuestion.delete as jest.Mock).mockResolvedValue({});

            await deleteOption(optionId);

            expect(prisma.possibleAnswerQuestion.delete).toHaveBeenCalledWith({
                where: { id: 88 },
            });
        });
    });
});
