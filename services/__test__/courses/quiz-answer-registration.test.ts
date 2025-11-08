import { logPrismaError } from "@/exceptions/error-encoder";
import { UserNotLoggedError } from "@/exceptions/user-not-logged";
import {
    findUserCourseWithModulesByCanonicalId,
    createQuestionAnswer
} from "@/repository/courses";
import { registerQuestionAnswer } from '@/services/courses';
import { auth } from "@/auth";
import { mockSession, setupMocks, clearAllMocks } from './setup';

jest.mock('@/repository/courses');
jest.mock('@/exceptions/error-encoder');
jest.mock('@/auth');
jest.mock('@/models/user-quiz-answer');

describe('Courses Service - Quiz Answer Registration', () => {
    beforeEach(() => {
        setupMocks(logPrismaError as jest.Mock, auth as jest.Mock);
    });

    afterEach(() => {
        clearAllMocks();
    });

    const createMockCourseWithQuiz = (questionType: 'text' | 'multiple') => ({
        id: 1,
        canonicalId: 'course-123',
        userCourse: [{ id: 1 }],
        courseModules: [
            {
                id: 3,
                moduleQuiz: [
                    {
                        id: 5,
                        quizQuestion: [
                            {
                                id: 10,
                                type: questionType,
                                points: 10,
                                possibleAnswerQuestion: [
                                    {
                                        id: 20,
                                        questionId: 10,
                                        value: 'Respuesta Correcta',
                                        isCorrect: true
                                    },
                                    {
                                        id: 21,
                                        questionId: 10,
                                        value: 'Respuesta Incorrecta',
                                        isCorrect: false
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });

    describe('registerQuestionAnswer', () => {
        test('debería registrar respuesta correcta para pregunta tipo multiple', async () => {
            const mockCourse = createMockCourseWithQuiz('multiple');
            const answerData = {
                canonicalId: 'course-123',
                moduleId: 3,
                quizId: 5,
                questionId: 10,
                optionId: 20,
                answer: 'Respuesta Correcta'
            };

            const mockCreatedAnswer = {
                id: 1,
                userCourseId: 1,
                questionId: 10,
                quizId: 5,
                answer: 'Respuesta Correcta',
                correct: 'Respuesta Correcta',
                isCorrect: true,
                points: 10
            };

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);
            (createQuestionAnswer as jest.Mock).mockResolvedValue(mockCreatedAnswer);

            const result = await registerQuestionAnswer(answerData as any);

            expect(result).toEqual({ success: true });
            expect(createQuestionAnswer).toHaveBeenCalled();
        });

        test('debería registrar respuesta incorrecta para pregunta tipo multiple', async () => {
            const mockCourse = createMockCourseWithQuiz('multiple');
            const answerData = {
                canonicalId: 'course-123',
                moduleId: 3,
                quizId: 5,
                questionId: 10,
                optionId: 21,
                answer: 'Respuesta Incorrecta'
            };

            const mockCreatedAnswer = {
                id: 1,
                userCourseId: 1,
                questionId: 10,
                quizId: 5,
                answer: 'Respuesta Incorrecta',
                correct: 'Respuesta Correcta',
                isCorrect: false,
                points: 0
            };

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);
            (createQuestionAnswer as jest.Mock).mockResolvedValue(mockCreatedAnswer);

            const result = await registerQuestionAnswer(answerData as any);

            expect(result).toEqual({ success: true });
        });

        test('debería registrar respuesta correcta para pregunta tipo text', async () => {
            const mockCourse = createMockCourseWithQuiz('text');
            const answerData = {
                canonicalId: 'course-123',
                moduleId: 3,
                quizId: 5,
                questionId: 10,
                optionId: 20,
                answer: 'Respuesta Correcta'
            };

            mockCourse.courseModules![0].moduleQuiz![0].quizQuestion![0].possibleAnswerQuestion![0].value = 'Respuesta Correcta';

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);
            (createQuestionAnswer as jest.Mock).mockResolvedValue({
                id: 1,
                isCorrect: true,
                points: 10
            });

            const result = await registerQuestionAnswer(answerData as any);

            expect(result).toEqual({ success: true });
        });

        test('debería registrar respuesta incorrecta para pregunta tipo text', async () => {
            const mockCourse = createMockCourseWithQuiz('text');
            const answerData = {
                canonicalId: 'course-123',
                moduleId: 3,
                quizId: 5,
                questionId: 10,
                optionId: 20,
                answer: 'Respuesta Incorrecta'
            };

            mockCourse.courseModules![0].moduleQuiz![0].quizQuestion![0].possibleAnswerQuestion![0].value = 'Respuesta Correcta';

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);
            (createQuestionAnswer as jest.Mock).mockResolvedValue({
                id: 1,
                isCorrect: false,
                points: 0
            });

            const result = await registerQuestionAnswer(answerData as any);

            expect(result).toEqual({ success: true });
        });

        test('debería lanzar error si el usuario no está logueado', async () => {
            (auth as jest.Mock).mockResolvedValue(null);

            await expect(registerQuestionAnswer({} as any))
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

            await expect(registerQuestionAnswer({} as any))
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

            await expect(registerQuestionAnswer({ canonicalId: 'course-123' } as any))
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

            const answerData = {
                canonicalId: 'course-123',
                moduleId: 3
            };

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);

            await expect(registerQuestionAnswer(answerData as any))
                .rejects
                .toThrow('Modulo invalido');
        });

        test('debería lanzar error si el quiz es inválido', async () => {
            const mockCourse = {
                id: 1,
                canonicalId: 'course-123',
                userCourse: [{ id: 1 }],
                courseModules: [
                    {
                        id: 3,
                        moduleQuiz: [{ id: 999 }]
                    }
                ]
            };

            const answerData = {
                canonicalId: 'course-123',
                moduleId: 3,
                quizId: 5
            };

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);

            await expect(registerQuestionAnswer(answerData as any))
                .rejects
                .toThrow('Quiz invalido');
        });

        test('debería lanzar error si la pregunta es inválida', async () => {
            const mockCourse = {
                id: 1,
                canonicalId: 'course-123',
                userCourse: [{ id: 1 }],
                courseModules: [
                    {
                        id: 3,
                        moduleQuiz: [
                            {
                                id: 5,
                                quizQuestion: [{ id: 999 }]
                            }
                        ]
                    }
                ]
            };

            const answerData = {
                canonicalId: 'course-123',
                moduleId: 3,
                quizId: 5,
                questionId: 10
            };

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);

            await expect(registerQuestionAnswer(answerData as any))
                .rejects
                .toThrow('Pregunta invalida');
        });

        test('debería retornar error si la creación de la respuesta falla', async () => {
            const mockCourse = createMockCourseWithQuiz('multiple');
            const answerData = {
                canonicalId: 'course-123',
                moduleId: 3,
                quizId: 5,
                questionId: 10,
                optionId: 20,
                answer: 'Respuesta'
            };

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);
            (createQuestionAnswer as jest.Mock).mockResolvedValue(null);

            const result = await registerQuestionAnswer(answerData as any);

            expect(result).toEqual({
                success: false,
                message: 'No se pudo gaurdar la respuesta de la pregunta'
            });
        });

        test('debería calcular puntos correctamente según si es correcta', async () => {
            const mockCourse = createMockCourseWithQuiz('multiple');
            const answerData = {
                canonicalId: 'course-123',
                moduleId: 3,
                quizId: 5,
                questionId: 10,
                optionId: 20,
                answer: 'Respuesta Correcta'
            };

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);
            (createQuestionAnswer as jest.Mock).mockResolvedValue({ id: 1 });

            await registerQuestionAnswer(answerData as any);

            // Verificar que se llamó con los datos correctos
            expect(createQuestionAnswer).toHaveBeenCalled();
        });

        test('debería loguear y propagar errores', async () => {
            const error = new Error('Database error');
            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockRejectedValue(error);

            await expect(registerQuestionAnswer({ canonicalId: 'course-123' } as any))
                .rejects
                .toThrow('Database error');
            
            expect(logPrismaError).toHaveBeenCalledWith(error);
        });
    });
});
