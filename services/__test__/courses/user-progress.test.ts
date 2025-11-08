import { logPrismaError } from "@/exceptions/error-encoder";
import { UserNotLoggedError } from "@/exceptions/user-not-logged";
import {
    findUserCourseWithModulesByCanonicalId,
    createUserClassState,
    createUserModuleFinishState
} from "@/repository/courses";
import {
    registerClassCurrentState,
    registerModuleFinishtState
} from '@/services/courses';
import { auth } from "@/auth";
import { mockSession, setupMocks, clearAllMocks } from './setup';

jest.mock('@/repository/courses');
jest.mock('@/exceptions/error-encoder');
jest.mock('@/auth');
jest.mock('@/models/user-classes-state');
jest.mock('@/models/user_module_state');

describe('Courses Service - User Progress', () => {
    beforeEach(() => {
        setupMocks(logPrismaError as jest.Mock, auth as jest.Mock);
    });

    afterEach(() => {
        clearAllMocks();
    });

    describe('registerClassCurrentState', () => {
        test('debería registrar el estado actual de una clase exitosamente', async () => {
            const mockCourse = {
                id: 1,
                canonicalId: 'course-123',
                userCourse: [{ id: 1 }]
            };

            const mockClassState = {
                id: 1,
                userCourseId: 1,
                classId: 5,
                currentVideoTime: 120,
                completed: false
            };

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);
            (createUserClassState as jest.Mock).mockResolvedValue(mockClassState);

            const result = await registerClassCurrentState('course-123', 5, 120, false);

            expect(findUserCourseWithModulesByCanonicalId).toHaveBeenCalledWith('course-123', 'user-123');
            expect(createUserClassState).toHaveBeenCalled();
            expect(result).toEqual({ success: true });
        });

        test('debería lanzar error si el usuario no está logueado', async () => {
            (auth as jest.Mock).mockResolvedValue(null);

            await expect(registerClassCurrentState('course-123', 5, 120, false))
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

            await expect(registerClassCurrentState('course-123', 5, 120, false))
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

            await expect(registerClassCurrentState('course-123', 5, 120, false))
                .rejects
                .toThrow('El curso no le pertenece al usuario');
        });

        test('debería retornar error si la creación del estado falla', async () => {
            const mockCourse = {
                id: 1,
                canonicalId: 'course-123',
                userCourse: [{ id: 1 }]
            };

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);
            (createUserClassState as jest.Mock).mockResolvedValue(null);

            const result = await registerClassCurrentState('course-123', 5, 120, false);

            expect(result).toEqual({ 
                success: false, 
                message: 'No se pudo gaurdar el estado de la clase' 
            });
        });

        test('debería registrar una clase como completada', async () => {
            const mockCourse = {
                id: 1,
                canonicalId: 'course-123',
                userCourse: [{ id: 1 }]
            };

            const mockClassState = {
                id: 1,
                userCourseId: 1,
                classId: 10,
                currentVideoTime: 300,
                completed: true
            };

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);
            (createUserClassState as jest.Mock).mockResolvedValue(mockClassState);

            const result = await registerClassCurrentState('course-123', 10, 300, true);

            expect(result).toEqual({ success: true });
        });

        test('debería manejar diferentes tiempos de video', async () => {
            const mockCourse = {
                id: 1,
                canonicalId: 'course-123',
                userCourse: [{ id: 1 }]
            };

            const mockClassState = {
                id: 1,
                userCourseId: 1,
                classId: 7,
                currentVideoTime: 0,
                completed: false
            };

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);
            (createUserClassState as jest.Mock).mockResolvedValue(mockClassState);

            await registerClassCurrentState('course-123', 7, 0, false);

            expect(createUserClassState).toHaveBeenCalled();
        });

        test('debería loguear y propagar errores', async () => {
            const error = new Error('Database error');
            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockRejectedValue(error);

            await expect(registerClassCurrentState('course-123', 5, 120, false))
                .rejects
                .toThrow('Database error');
            
            expect(logPrismaError).toHaveBeenCalledWith(error);
        });
    });

    describe('registerModuleFinishtState', () => {
        test('debería registrar el estado de finalización de un módulo exitosamente', async () => {
            const mockCourse = {
                id: 1,
                canonicalId: 'course-123',
                userCourse: [{ id: 1 }]
            };

            const mockModuleState = {
                id: 1,
                userCourseId: 1,
                moduleId: 3,
                completed: true
            };

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);
            (createUserModuleFinishState as jest.Mock).mockResolvedValue(mockModuleState);

            const result = await registerModuleFinishtState('course-123', 3);

            expect(findUserCourseWithModulesByCanonicalId).toHaveBeenCalledWith('course-123', 'user-123');
            expect(createUserModuleFinishState).toHaveBeenCalled();
            expect(result).toEqual({ success: true });
        });

        test('debería lanzar error si el usuario no está logueado', async () => {
            (auth as jest.Mock).mockResolvedValue(null);

            await expect(registerModuleFinishtState('course-123', 3))
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

            await expect(registerModuleFinishtState('course-123', 3))
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

            await expect(registerModuleFinishtState('course-123', 3))
                .rejects
                .toThrow('El curso no le pertenece al usuario');
        });

        test('debería retornar error si la creación del estado falla', async () => {
            const mockCourse = {
                id: 1,
                canonicalId: 'course-123',
                userCourse: [{ id: 1 }]
            };

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);
            (createUserModuleFinishState as jest.Mock).mockResolvedValue(null);

            const result = await registerModuleFinishtState('course-123', 3);

            expect(result).toEqual({ 
                success: false, 
                message: 'No se pudo gaurdar el estado del modulo' 
            });
        });

        test('debería manejar diferentes módulos', async () => {
            const mockCourse = {
                id: 1,
                canonicalId: 'course-123',
                userCourse: [{ id: 5 }]
            };

            const mockModuleState = {
                id: 1,
                userCourseId: 5,
                moduleId: 10,
                completed: true
            };

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);
            (createUserModuleFinishState as jest.Mock).mockResolvedValue(mockModuleState);

            await registerModuleFinishtState('course-123', 10);

            expect(createUserModuleFinishState).toHaveBeenCalled();
        });

        test('debería usar el userCourseId correcto al crear el estado', async () => {
            const mockCourse = {
                id: 1,
                canonicalId: 'course-123',
                userCourse: [{ id: 888 }]
            };

            const mockModuleState = {
                id: 1,
                userCourseId: 888,
                moduleId: 7,
                completed: true
            };

            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockResolvedValue(mockCourse);
            (createUserModuleFinishState as jest.Mock).mockResolvedValue(mockModuleState);

            const result = await registerModuleFinishtState('course-123', 7);

            expect(result).toEqual({ success: true });
        });

        test('debería loguear y propagar errores', async () => {
            const error = new Error('Database error');
            (findUserCourseWithModulesByCanonicalId as jest.Mock).mockRejectedValue(error);

            await expect(registerModuleFinishtState('course-123', 3))
                .rejects
                .toThrow('Database error');
            
            expect(logPrismaError).toHaveBeenCalledWith(error);
        });
    });
});
