import { logPrismaError } from "@/exceptions/error-encoder";
import { UserNotLoggedError } from "@/exceptions/user-not-logged";
import { getUserCourses } from '@/services/courses';
import { prismaStudentCourseReadPort } from '@/repository/course-read.prisma';
import { auth } from "@/auth";
import { mockSession, setupMocks, clearAllMocks } from './setup';

jest.mock('@/repository/course-read.prisma', () => ({
    prismaStudentCourseReadPort: { findEnrolledCourses: jest.fn() },
}));
jest.mock('@/exceptions/error-encoder');
jest.mock('@/auth');

describe('Courses Service - User Course Retrieval', () => {
    beforeEach(() => {
        setupMocks(logPrismaError as jest.Mock, auth as jest.Mock);
    });

    afterEach(() => {
        clearAllMocks();
    });

    describe('getUserCourses', () => {
        test('retorna la proyección serializable del puerto de estudiante', async () => {
            const courses = [{ canonicalId: 'web-dev-101', progressPercent: 0 }];
            (prismaStudentCourseReadPort.findEnrolledCourses as jest.Mock).mockResolvedValue(courses);

            await expect(getUserCourses()).resolves.toEqual(courses);
            expect(prismaStudentCourseReadPort.findEnrolledCourses).toHaveBeenCalledWith('user-123');
        });

        test('debería retornar array vacío en caso de error', async () => {
            const error = new Error('Database error');
            (prismaStudentCourseReadPort.findEnrolledCourses as jest.Mock).mockRejectedValue(error);

            const result = await getUserCourses();

            expect(result).toEqual([]);
            expect(logPrismaError).toHaveBeenCalledWith(error);
        });

        test('debería requerir usuario logueado', async () => {
            (auth as jest.Mock).mockResolvedValue(null);

            await expect(getUserCourses()).rejects.toThrow(UserNotLoggedError);
        });
    });
});
