import { logPrismaError } from "@/exceptions/error-encoder";
import { UserNotLoggedError } from "@/exceptions/user-not-logged";
import {
    findUserCourseByCanonicalId,
    findUserCourseWithModulesByCanonicalId,
    findQuizAnswersByQuizId,
    findUserQuizState
} from "@/repository/courses";
import {
    getUserCourseQuizAnswers,
    getUserQuizState
} from '@/services/courses';
import { auth } from "@/auth";
import { mockSession, setupMocks, clearAllMocks } from './setup';

jest.mock('@/repository/courses');
jest.mock('@/exceptions/error-encoder');
jest.mock('@/auth');

describe('Courses Service - Quiz Retrieval', () => {
    beforeEach(() => {
        setupMocks(logPrismaError as jest.Mock, auth as jest.Mock);
    });

    afterEach(() => {
        clearAllMocks();
    });

    describe('getUserCourseQuizAnswers', () => {
        test('debería retornar las respuestas del quiz de un usuario', async () => {
            const mockCourse = {
                id: 1,
                canonicalId: 'course-123',
                userCourse: [{ id: 1 }]
            };

            const mockQuizAnswers = [
                {
                    id: 1,
                    userCourseId: 1,
                    questionId: 1,
                    quizId: 1,
                    answer: 'Respuesta A',
                    correct: 'Respuesta A',
                    isCorrect: true,
                    points: 10
                },
                {
                    id: 2,
                    userCourseId: 1,
                    questionId: 2,
                    quizId: 1,
                    answer: 'Respuesta B',
                    correct: 'Respuesta B',
                    isCorrect: true,
                    points: 10
                }
            ];

            (findUserCourseByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);
            (findQuizAnswersByQuizId as jest.Mock).mockResolvedValue(mockQuizAnswers);

            const result = await getUserCourseQuizAnswers('course-123', 1);

            expect(findUserCourseByCanonicalId).toHaveBeenCalledWith('course-123', 'user-123');
            expect(findQuizAnswersByQuizId).toHaveBeenCalledWith(1, 1);
            expect(result).toEqual(mockQuizAnswers);
            expect(result).toHaveLength(2);
        });

        test('debería lanzar error si el usuario no está logueado', async () => {
            (auth as jest.Mock).mockResolvedValue(null);

            await expect(getUserCourseQuizAnswers('course-123', 1))
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

            await expect(getUserCourseQuizAnswers('course-123', 1))
                .rejects
                .toThrow(UserNotLoggedError);
        });

        test('debería lanzar error si el curso no pertenece al usuario', async () => {
            const mockCourse = {
                id: 1,
                canonicalId: 'course-123',
                userCourse: []
            };

            (findUserCourseByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);

            await expect(getUserCourseQuizAnswers('course-123', 1))
                .rejects
                .toThrow('Este curso no pertenece al usuario');
        });

        test('debería retornar array vacío si no hay respuestas', async () => {
            const mockCourse = {
                id: 1,
                canonicalId: 'course-123',
                userCourse: [{ id: 1 }]
            };

            (findUserCourseByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);
            (findQuizAnswersByQuizId as jest.Mock).mockResolvedValue([]);

            const result = await getUserCourseQuizAnswers('course-123', 1);

            expect(result).toEqual([]);
        });

        test('debería loguear y propagar errores', async () => {
            const error = new Error('Database error');
            (findUserCourseByCanonicalId as jest.Mock).mockRejectedValue(error);

            await expect(getUserCourseQuizAnswers('course-123', 1))
                .rejects
                .toThrow('Database error');
            
            expect(logPrismaError).toHaveBeenCalledWith(error);
        });

        test('debería usar el userCourseId correcto al buscar respuestas', async () => {
            const mockCourse = {
                id: 1,
                canonicalId: 'course-123',
                userCourse: [{ id: 999 }]
            };

            (findUserCourseByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);
            (findQuizAnswersByQuizId as jest.Mock).mockResolvedValue([]);

            await getUserCourseQuizAnswers('course-123', 5);

            expect(findQuizAnswersByQuizId).toHaveBeenCalledWith(999, 5);
        });
    });

    describe('getUserQuizState', () => {
        test('debería retornar el estado del quiz de un usuario', async () => {
            const mockCourse = {
                id: 1,
                canonicalId: 'course-123',
                userCourse: [{ id: 1 }]
            };

            const mockQuizState = {
                id: 1,
                quizId: 5,
                userCourseId: 1,
                courseModuleId: 3,
                retries: 2,
                result: 85,
                passed: true
            };

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);
            (findUserQuizState as jest.Mock).mockResolvedValue(mockQuizState);

            const result = await getUserQuizState('course-123', 5);

            expect(findUserCourseWithModulesByCanonicalId).toHaveBeenCalledWith('course-123', 'user-123');
            expect(findUserQuizState).toHaveBeenCalledWith(5, 1);
            expect(result).toEqual(mockQuizState);
        });

        test('debería lanzar error si el usuario no está logueado', async () => {
            (auth as jest.Mock).mockResolvedValue(null);

            await expect(getUserQuizState('course-123', 1))
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

            await expect(getUserQuizState('course-123', 1))
                .rejects
                .toThrow(UserNotLoggedError);
        });

        test('debería lanzar error si el curso no pertenece al usuario', async () => {
            const mockCourse = {
                id: 1,
                canonicalId: 'course-123',
                userCourse: null
            };

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);

            await expect(getUserQuizState('course-123', 1))
                .rejects
                .toThrow('El curso no le pertenece al usuario');
        });

        test('debería loguear y propagar errores', async () => {
            const error = new Error('Database error');
            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockRejectedValue(error);

            await expect(getUserQuizState('course-123', 1))
                .rejects
                .toThrow('Database error');
            
            expect(logPrismaError).toHaveBeenCalledWith(error);
        });

        test('debería usar el userCourseId correcto al buscar el estado', async () => {
            const mockCourse = {
                id: 1,
                canonicalId: 'course-123',
                userCourse: [{ id: 777 }]
            };

            const mockQuizState = {
                id: 1,
                quizId: 10,
                userCourseId: 777,
                retries: 1,
                result: 90,
                passed: true
            };

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);
            (findUserQuizState as jest.Mock).mockResolvedValue(mockQuizState);

            await getUserQuizState('course-123', 10);

            expect(findUserQuizState).toHaveBeenCalledWith(10, 777);
        });

        test('debería manejar múltiples intentos del quiz', async () => {
            const mockCourse = {
                id: 1,
                canonicalId: 'course-123',
                userCourse: [{ id: 1 }]
            };

            const mockQuizState = {
                id: 1,
                quizId: 5,
                userCourseId: 1,
                courseModuleId: 3,
                retries: 5,
                result: 95,
                passed: true
            };

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);
            (findUserQuizState as jest.Mock).mockResolvedValue(mockQuizState);

            const result = await getUserQuizState('course-123', 5);

            expect(result.retries).toBe(5);
            expect(result.passed).toBe(true);
        });
    });
});
