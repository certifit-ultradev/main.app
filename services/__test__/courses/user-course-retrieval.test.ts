import { logPrismaError } from "@/exceptions/error-encoder";
import { UserNotLoggedError } from "@/exceptions/user-not-logged";
import { CourseNotPurchasedError } from "@/exceptions/course-not-purchased";
import { NotFoundError } from "@/exceptions/not-found";
import {
    findUserCourseWithModulesByCanonicalId,
    findUserCourseByCanonicalId,
    findCourseByCanonicalId,
    findThreeCoursesActives,
    findUserCourses
} from "@/repository/courses";
import {
    getUserCourseWithModulesByCanonicalId,
    getUserCourseByCanonicalId,
    getCourseByCanonicalId,
    getTopThreeCourses,
    getUserCourses
} from '@/services/courses';
import { auth } from "@/auth";
import { mockSession, setupMocks, clearAllMocks } from './setup';

jest.mock('@/repository/courses');
jest.mock('@/exceptions/error-encoder');
jest.mock('@/auth');

describe('Courses Service - User Course Retrieval', () => {
    beforeEach(() => {
        setupMocks(logPrismaError as jest.Mock, auth as jest.Mock);
    });

    afterEach(() => {
        clearAllMocks();
    });

    describe('getUserCourseWithModulesByCanonicalId', () => {
        test('debería lanzar error si el usuario no está logueado', async () => {
            (auth as jest.Mock).mockResolvedValue(null);

            await expect(getUserCourseWithModulesByCanonicalId('course-123'))
                .rejects
                .toThrow(UserNotLoggedError);
        });

        test('debería lanzar error si el email no está verificado', async () => {
            (auth as jest.Mock).mockResolvedValue({
                user: {
                    id: 'user-123',
                    emailVerified: null
                }
            });

            await expect(getUserCourseWithModulesByCanonicalId('course-123'))
                .rejects
                .toThrow(UserNotLoggedError);
        });

        test('debería lanzar error si el curso no está comprado', async () => {
            const mockCourse = {
                id: 1,
                canonicalId: 'course-123',
                title: 'Test Course',
                userCourse: []
            };

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);

            await expect(getUserCourseWithModulesByCanonicalId('course-123'))
                .rejects
                .toThrow(CourseNotPurchasedError);
        });

        test('debería lanzar error si el curso no tiene módulos', async () => {
            const mockCourse = {
                id: 1,
                canonicalId: 'course-123',
                title: 'Test Course',
                courseModules: null,
                userCourse: [{ id: 1 }]
            };

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);

            await expect(getUserCourseWithModulesByCanonicalId('course-123'))
                .rejects
                .toThrow(CourseNotPurchasedError);
        });
    });

    describe('getUserCourseByCanonicalId', () => {
        test('debería retornar curso vacío si no se encuentra (NotFoundError)', async () => {
            (findUserCourseByCanonicalId as jest.Mock).mockRejectedValue(
                new NotFoundError('Course not found')
            );

            const result = await getUserCourseByCanonicalId('non-existent');

            expect(result).toEqual({});
        });

        test('debería lanzar error si el usuario no está logueado', async () => {
            (auth as jest.Mock).mockResolvedValue(null);

            await expect(getUserCourseByCanonicalId('course-123'))
                .rejects
                .toThrow(UserNotLoggedError);
        });

        test('debería propagar errores que no sean NotFoundError', async () => {
            const error = new Error('Database error');
            (findUserCourseByCanonicalId as jest.Mock).mockRejectedValue(error);

            await expect(getUserCourseByCanonicalId('course-123'))
                .rejects
                .toThrow('Database error');
        });
    });

    describe('getCourseByCanonicalId', () => {
        test('debería retornar un curso por canonicalId', async () => {
            const mockCourse = {
                id: 1,
                canonicalId: 'web-dev-101',
                title: 'Web Development 101'
            };

            (findCourseByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);

            const result = await getCourseByCanonicalId('web-dev-101');

            expect(findCourseByCanonicalId).toHaveBeenCalledWith('web-dev-101', 'user-123');
            expect(result).toEqual(mockCourse);
        });

        test('debería requerir usuario logueado', async () => {
            (auth as jest.Mock).mockResolvedValue(null);

            await expect(getCourseByCanonicalId('course-123'))
                .rejects
                .toThrow(UserNotLoggedError);
        });
    });

    describe('getTopThreeCourses', () => {
        test('debería retornar array vacío en caso de error', async () => {
            const error = new Error('Database error');
            (findThreeCoursesActives as jest.Mock).mockRejectedValue(error);

            const result = await getTopThreeCourses();

            expect(result).toEqual([]);
            expect(logPrismaError).toHaveBeenCalledWith(error);
        });

        test('debería filtrar cursos expirados', async () => {
            const now = new Date();
            const futureDate = new Date(now.getTime() + 86400000); // +1 día
            const pastDate = new Date(now.getTime() - 86400000); // -1 día

            const mockCourses = [
                {
                    id: 1,
                    canonicalId: 'active-course',
                    title: 'Active Course',
                    expiresAt: futureDate,
                    userCourse: []
                },
                {
                    id: 2,
                    canonicalId: 'expired-course',
                    title: 'Expired Course',
                    expiresAt: pastDate,
                    userCourse: []
                }
            ];

            (findThreeCoursesActives as jest.Mock).mockResolvedValue(mockCourses);

            const result = await getTopThreeCourses();

            expect(result).toHaveLength(1);
            expect(result[0].canonicalId).toBe('active-course');
        });
    });

    describe('getUserCourses', () => {
        test('debería retornar array vacío en caso de error', async () => {
            const error = new Error('Database error');
            (findUserCourses as jest.Mock).mockRejectedValue(error);

            const result = await getUserCourses();

            expect(result).toEqual([]);
            expect(logPrismaError).toHaveBeenCalledWith(error);
        });

        test('debería requerir usuario logueado', async () => {
            (auth as jest.Mock).mockResolvedValue(null);

            const result = await getUserCourses();

            expect(result).toEqual([]);
        });
    });
});
