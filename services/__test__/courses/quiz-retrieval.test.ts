import { auth } from '@/auth';
import { UserNotLoggedError } from '@/exceptions/user-not-logged';
import { prismaStudentQuizReadPort } from '@/repository/course-read.prisma';
import { getUserCourseQuizAnswers, getUserQuizState } from '@/services/courses';
import { mockSession } from './setup';

jest.mock('@/auth');
jest.mock('@/repository/course-read.prisma', () => ({
    prismaCourseCatalogReadPort: {},
    prismaCourseEditorReadPort: {},
    prismaStudentCourseReadPort: {},
    prismaStudentQuizReadPort: { findAnswers: jest.fn(), findLatestAttempt: jest.fn() },
}));

describe('Courses Service - Student quiz retrieval', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (auth as jest.Mock).mockResolvedValue(mockSession);
    });

    it('reads a student answer projection scoped by authenticated user and course', async () => {
        (prismaStudentQuizReadPort.findAnswers as jest.Mock).mockResolvedValue([
            { questionId: 1, answer: 'Respuesta A' },
        ]);

        await expect(getUserCourseQuizAnswers('course-123', 5)).resolves.toEqual([
            { questionId: 1, answer: 'Respuesta A' },
        ]);
        expect(prismaStudentQuizReadPort.findAnswers).toHaveBeenCalledWith('course-123', 'user-123', 5);
    });

    it('uses an empty array as the normal absence of saved answers', async () => {
        (prismaStudentQuizReadPort.findAnswers as jest.Mock).mockResolvedValue([]);

        await expect(getUserCourseQuizAnswers('course-123', 5)).resolves.toEqual([]);
    });

    it('uses null as the normal absence of a persisted quiz attempt', async () => {
        (prismaStudentQuizReadPort.findLatestAttempt as jest.Mock).mockResolvedValue(null);

        await expect(getUserQuizState('course-123', 5)).resolves.toBeNull();
        expect(prismaStudentQuizReadPort.findLatestAttempt).toHaveBeenCalledWith('course-123', 'user-123', 5);
    });

    it('returns the minimal persisted attempt projection', async () => {
        (prismaStudentQuizReadPort.findLatestAttempt as jest.Mock).mockResolvedValue({
            quizId: 5, courseModuleId: 3, retries: 2, result: 85, passed: true,
        });

        await expect(getUserQuizState('course-123', 5)).resolves.toEqual({
            quizId: 5, courseModuleId: 3, retries: 2, result: 85, passed: true,
        });
    });

    it('requires an authenticated and verified user before reading quiz state', async () => {
        (auth as jest.Mock).mockResolvedValue(null);

        await expect(getUserQuizState('course-123', 5)).rejects.toThrow(UserNotLoggedError);
        expect(prismaStudentQuizReadPort.findLatestAttempt).not.toHaveBeenCalled();
    });
});
