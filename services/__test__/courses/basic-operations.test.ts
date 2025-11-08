import { logPrismaError } from "@/exceptions/error-encoder";
import {
    allCourses,
    countAllCourses,
    findCourseById,
    findModulesByCourseId
} from "@/repository/courses";
import {
    getAllCourses,
    getCourseById,
    getModulesByCourseId
} from '@/services/courses';
import { auth } from "@/auth";
import { mockSession, setupMocks, clearAllMocks } from './setup';

jest.mock('@/repository/courses');
jest.mock('@/exceptions/error-encoder');
jest.mock('@/auth');

describe('Courses Service - Basic Operations', () => {
    beforeEach(() => {
        setupMocks(logPrismaError as jest.Mock, auth as jest.Mock);
    });

    afterEach(() => {
        clearAllMocks();
    });

    describe('getAllCourses', () => {
        test('debería retornar cursos paginados', async () => {
            const mockCourses = [
                { id: 1, title: 'Course 1' },
                { id: 2, title: 'Course 2' }
            ];

            (allCourses as jest.Mock).mockResolvedValue(mockCourses);
            (countAllCourses as jest.Mock).mockResolvedValue(20);

            const result = await getAllCourses({ page: 1 });

            expect(allCourses).toHaveBeenCalledWith(1, 10);
            expect(countAllCourses).toHaveBeenCalledTimes(1);
            expect(result).toEqual({
                data: mockCourses,
                page: 1,
                lastPage: 2,
                total: 2
            });
        });

        test('debería loguear y propagar errores', async () => {
            const error = new Error('Database error');
            (allCourses as jest.Mock).mockRejectedValue(error);

            await expect(getAllCourses({ page: 1 })).rejects.toThrow('Database error');
            expect(logPrismaError).toHaveBeenCalledWith(error);
        });

        test('debería calcular correctamente el total de páginas', async () => {
            (allCourses as jest.Mock).mockResolvedValue([]);
            (countAllCourses as jest.Mock).mockResolvedValue(25);

            const result = await getAllCourses({ page: 1 });

            expect(result.lastPage).toBe(3); // 25 / 10 = 2.5, redondeado a 3
            expect(result.total).toBe(3);
        });
    });

    describe('getCourseById', () => {
        test('debería retornar un curso por ID', async () => {
            const mockCourse = {
                id: 1,
                title: 'Test Course',
                description: 'Test Description'
            };

            (findCourseById as jest.Mock).mockResolvedValue(mockCourse);

            const result = await getCourseById(1);

            expect(findCourseById).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockCourse);
        });

        test('debería loguear y propagar errores', async () => {
            const error = new Error('Course not found');
            (findCourseById as jest.Mock).mockRejectedValue(error);

            await expect(getCourseById(999)).rejects.toThrow('Course not found');
            expect(logPrismaError).toHaveBeenCalledWith(error);
        });
    });

    describe('getModulesByCourseId', () => {
        test('debería retornar los módulos de un curso', async () => {
            const mockModules = [
                { id: 1, title: 'Module 1', courseId: 1 },
                { id: 2, title: 'Module 2', courseId: 1 }
            ];

            (findModulesByCourseId as jest.Mock).mockResolvedValue(mockModules);

            const result = await getModulesByCourseId(1);

            expect(findModulesByCourseId).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockModules);
            expect(result).toHaveLength(2);
        });

        test('debería loguear y propagar errores', async () => {
            const error = new Error('Modules not found');
            (findModulesByCourseId as jest.Mock).mockRejectedValue(error);

            await expect(getModulesByCourseId(1)).rejects.toThrow('Modules not found');
            expect(logPrismaError).toHaveBeenCalledWith(error);
        });
    });
});
