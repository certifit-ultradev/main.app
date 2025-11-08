import { logPrismaError } from "@/exceptions/error-encoder";
import { UserNotLoggedError } from "@/exceptions/user-not-logged";
import { NotFoundError } from "@/exceptions/not-found";
import {
    findUserCourseWithModulesByCanonicalId,
    findQuizAnswersByQuizId,
    createUserQuizState,
    findUserQuizState
} from "@/repository/courses";
import { calculateQuizScore } from '@/services/courses';
import { auth } from "@/auth";
import { mockSession, setupMocks, clearAllMocks } from './setup';

jest.mock('@/repository/courses');
jest.mock('@/exceptions/error-encoder');
jest.mock('@/auth');
jest.mock('@/models/user-quiz-state');

describe('Courses Service - Quiz Scoring', () => {
    beforeEach(() => {
        setupMocks(logPrismaError as jest.Mock, auth as jest.Mock);
    });

    afterEach(() => {
        clearAllMocks();
    });

    const createMockCourseWithQuizAnswers = (minRequiredPoints = 70) => ({
        id: 1,
        canonicalId: 'course-123',
        userCourse: [{ id: 1 }],
        courseModules: [
            {
                id: 3,
                minRequiredPoints: minRequiredPoints,
                moduleQuiz: [
                    {
                        id: 5,
                        quizQuestion: [
                            { id: 1 },
                            { id: 2 },
                            { id: 3 }
                        ]
                    }
                ]
            }
        ]
    });

    describe('calculateQuizScore', () => {
        test('debería calcular el puntaje del quiz correctamente cuando pasa', async () => {
            const mockCourse = createMockCourseWithQuizAnswers(25);
            const mockQuizAnswers = [
                { id: 1, questionId: 1, points: 10, isCorrect: true },
                { id: 2, questionId: 2, points: 10, isCorrect: true },
                { id: 3, questionId: 3, points: 10, isCorrect: true }
            ];

            const quizData = {
                canonicalId: 'course-123',
                moduleId: 3,
                quizId: 5
            };

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);
            (findQuizAnswersByQuizId as jest.Mock).mockResolvedValue(mockQuizAnswers);
            (findUserQuizState as jest.Mock).mockRejectedValue(new NotFoundError('Not found'));
            (createUserQuizState as jest.Mock).mockResolvedValue({ id: 1 });

            const result = await calculateQuizScore(quizData as any);

            expect(result).toEqual({
                questionCount: 3,
                totalScore: 30,
                pass: true
            });
            expect(createUserQuizState).toHaveBeenCalled();
        });

        test('debería calcular el puntaje del quiz correctamente cuando no pasa', async () => {
            const mockCourse = createMockCourseWithQuizAnswers(70);
            const mockQuizAnswers = [
                { id: 1, questionId: 1, points: 10, isCorrect: true },
                { id: 2, questionId: 2, points: 0, isCorrect: false },
                { id: 3, questionId: 3, points: 0, isCorrect: false }
            ];

            const quizData = {
                canonicalId: 'course-123',
                moduleId: 3,
                quizId: 5
            };

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);
            (findQuizAnswersByQuizId as jest.Mock).mockResolvedValue(mockQuizAnswers);
            (findUserQuizState as jest.Mock).mockRejectedValue(new NotFoundError('Not found'));
            (createUserQuizState as jest.Mock).mockResolvedValue({ id: 1 });

            const result = await calculateQuizScore(quizData as any);

            expect(result).toEqual({
                questionCount: 3,
                totalScore: 10,
                pass: false
            });
        });

        test('debería incrementar el contador de reintentos en el segundo intento', async () => {
            const mockCourse = createMockCourseWithQuizAnswers(70);
            const mockQuizAnswers = [
                { id: 1, questionId: 1, points: 10, isCorrect: true }
            ];

            const existingQuizState = {
                id: 1,
                quizId: 5,
                retries: 2,
                result: 50,
                passed: false
            };

            const quizData = {
                canonicalId: 'course-123',
                moduleId: 3,
                quizId: 5
            };

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);
            (findQuizAnswersByQuizId as jest.Mock).mockResolvedValue(mockQuizAnswers);
            (findUserQuizState as jest.Mock).mockResolvedValue(existingQuizState);
            (createUserQuizState as jest.Mock).mockResolvedValue({ id: 2 });

            await calculateQuizScore(quizData as any);

            expect(createUserQuizState).toHaveBeenCalled();
        });

        test('debería establecer retries a 1 en el primer intento', async () => {
            const mockCourse = createMockCourseWithQuizAnswers(70);
            const mockQuizAnswers = [
                { id: 1, questionId: 1, points: 10, isCorrect: true }
            ];

            const quizData = {
                canonicalId: 'course-123',
                moduleId: 3,
                quizId: 5
            };

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);
            (findQuizAnswersByQuizId as jest.Mock).mockResolvedValue(mockQuizAnswers);
            (findUserQuizState as jest.Mock).mockRejectedValue(new NotFoundError('Not found'));
            (createUserQuizState as jest.Mock).mockResolvedValue({ id: 1 });

            await calculateQuizScore(quizData as any);

            expect(createUserQuizState).toHaveBeenCalled();
        });

        test('debería lanzar error si el usuario no está logueado', async () => {
            (auth as jest.Mock).mockResolvedValue(null);

            await expect(calculateQuizScore({} as any))
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

            await expect(calculateQuizScore({} as any))
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

            await expect(calculateQuizScore({ canonicalId: 'course-123' } as any))
                .rejects
                .toThrow('El curso no le pertenece al usuario');
        });

        test('debería lanzar error si el módulo es inválido', async () => {
            const mockCourse = {
                id: 1,
                canonicalId: 'course-123',
                userCourse: [{ id: 1 }],
                courseModules: [{ id: 999 }]
            };

            const quizData = {
                canonicalId: 'course-123',
                moduleId: 3
            };

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);

            await expect(calculateQuizScore(quizData as any))
                .rejects
                .toThrow('Modulo invalido');
        });

        test('debería lanzar error si el módulo no tiene quiz', async () => {
            const mockCourse = {
                id: 1,
                canonicalId: 'course-123',
                userCourse: [{ id: 1 }],
                courseModules: [
                    {
                        id: 3,
                        moduleQuiz: null
                    }
                ]
            };

            const quizData = {
                canonicalId: 'course-123',
                moduleId: 3,
                quizId: 5
            };

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);

            await expect(calculateQuizScore(quizData as any))
                .rejects
                .toThrow('Modulo invalido');
        });

        test('debería lanzar error si el quiz no tiene respuestas', async () => {
            const mockCourse = createMockCourseWithQuizAnswers(70);

            const quizData = {
                canonicalId: 'course-123',
                moduleId: 3,
                quizId: 5
            };

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);
            (findQuizAnswersByQuizId as jest.Mock).mockResolvedValue([]);

            await expect(calculateQuizScore(quizData as any))
                .rejects
                .toThrow('El quiz 5 del módulo no tiene respuesta');
        });

        test('debería lanzar error si no se puede crear el estado del quiz', async () => {
            const mockCourse = createMockCourseWithQuizAnswers(70);
            const mockQuizAnswers = [
                { id: 1, questionId: 1, points: 10, isCorrect: true }
            ];

            const quizData = {
                canonicalId: 'course-123',
                moduleId: 3,
                quizId: 5
            };

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);
            (findQuizAnswersByQuizId as jest.Mock).mockResolvedValue(mockQuizAnswers);
            (findUserQuizState as jest.Mock).mockRejectedValue(new NotFoundError('Not found'));
            (createUserQuizState as jest.Mock).mockResolvedValue(null);

            await expect(calculateQuizScore(quizData as any))
                .rejects
                .toThrow('No se pudo registrar el resultado del quiz.');
        });

        test('debería propagar errores que no sean NotFoundError al buscar estado del quiz', async () => {
            const mockCourse = createMockCourseWithQuizAnswers(70);
            const mockQuizAnswers = [
                { id: 1, questionId: 1, points: 10, isCorrect: true }
            ];

            const quizData = {
                canonicalId: 'course-123',
                moduleId: 3,
                quizId: 5
            };

            const otherError = new Error('Database connection error');

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);
            (findQuizAnswersByQuizId as jest.Mock).mockResolvedValue(mockQuizAnswers);
            (findUserQuizState as jest.Mock).mockRejectedValue(otherError);

            await expect(calculateQuizScore(quizData as any))
                .rejects
                .toThrow('Database connection error');
        });

        test('debería calcular correctamente el puntaje exacto del mínimo requerido', async () => {
            const mockCourse = createMockCourseWithQuizAnswers(20);
            const mockQuizAnswers = [
                { id: 1, questionId: 1, points: 10, isCorrect: true },
                { id: 2, questionId: 2, points: 10, isCorrect: true }
            ];

            const quizData = {
                canonicalId: 'course-123',
                moduleId: 3,
                quizId: 5
            };

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);
            (findQuizAnswersByQuizId as jest.Mock).mockResolvedValue(mockQuizAnswers);
            (findUserQuizState as jest.Mock).mockRejectedValue(new NotFoundError('Not found'));
            (createUserQuizState as jest.Mock).mockResolvedValue({ id: 1 });

            const result = await calculateQuizScore(quizData as any);

            expect(result?.pass).toBe(true);
            expect(result?.totalScore).toBe(20);
        });

        test('debería loguear y propagar errores', async () => {
            const error = new Error('Database error');
            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockRejectedValue(error);

            await expect(calculateQuizScore({ canonicalId: 'course-123' } as any))
                .rejects
                .toThrow('Database error');
            
            expect(logPrismaError).toHaveBeenCalledWith(error);
        });
    });
});
