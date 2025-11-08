import { logPrismaError } from "@/exceptions/error-encoder";
import {
    createFullCourse,
    updateFullCourse,
    updateClass,
    updateCourse,
    countAllActiveCourses
} from "@/repository/courses";
import {
    registerCourse,
    editCourse,
    updateClassVideoPath,
    activateCourse,
    deactivateCourse
} from '@/services/courses';
import { auth } from "@/auth";
import { diffCourses } from "@/utils/diff";
import { mockSession, setupMocks, clearAllMocks } from './setup';

jest.mock('@/repository/courses');
jest.mock('@/exceptions/error-encoder');
jest.mock('@/auth');
jest.mock('@/utils/diff');

describe('Courses Service - Course Management', () => {
    beforeEach(() => {
        setupMocks(logPrismaError as jest.Mock, auth as jest.Mock);
    });

    afterEach(() => {
        clearAllMocks();
    });

    describe('registerCourse', () => {
        test('debería crear un curso completo', async () => {
            const courseData = {
                title: 'New Course',
                description: 'Course Description',
                price: 100000
            };

            const mockCreatedCourse = {
                id: 1,
                ...courseData
            };

            (createFullCourse as jest.Mock).mockResolvedValue(mockCreatedCourse);

            const result = await registerCourse(courseData as any);

            expect(createFullCourse).toHaveBeenCalledWith(courseData);
            expect(result).toEqual(mockCreatedCourse);
        });

        test('debería loguear y propagar errores', async () => {
            const error = new Error('Creation failed');
            (createFullCourse as jest.Mock).mockRejectedValue(error);

            await expect(registerCourse({} as any)).rejects.toThrow('Creation failed');
            expect(logPrismaError).toHaveBeenCalledWith(error);
        });
    });

    describe('editCourse', () => {
        const originalCourseData = {
            id: 1,
            title: 'Original Course',
            description: 'Original description',
            price: 100
        };

        const newCourseData = {
            id: 1,
            title: 'Updated Course',
            description: 'Updated description',
            price: 150
        };

        test('debería actualizar un curso con cambios', async () => {
            const mockChanges = [
                { action: 'updated', field: 'title', oldValue: 'Original Course', newValue: 'Updated Course' },
                { action: 'updated', field: 'price', oldValue: 100, newValue: 150 }
            ];

            (diffCourses as jest.Mock).mockReturnValue(mockChanges);
            (updateFullCourse as jest.Mock).mockResolvedValue(undefined);

            await editCourse(originalCourseData as any, newCourseData as any);

            expect(diffCourses).toHaveBeenCalledWith(originalCourseData, newCourseData);
            expect(updateFullCourse).toHaveBeenCalledWith(1, [], mockChanges, []);
        });

        test('debería manejar cambios agregados', async () => {
            const mockChanges = [
                { action: 'added', field: 'newModule', value: 'Module 1' }
            ];

            (diffCourses as jest.Mock).mockReturnValue(mockChanges);
            (updateFullCourse as jest.Mock).mockResolvedValue(undefined);

            await editCourse(originalCourseData as any, newCourseData as any);

            expect(updateFullCourse).toHaveBeenCalledWith(1, mockChanges, [], []);
        });

        test('debería manejar cambios eliminados', async () => {
            const mockChanges = [
                { action: 'deleted', field: 'oldModule', value: 'Module 1' }
            ];

            (diffCourses as jest.Mock).mockReturnValue(mockChanges);
            (updateFullCourse as jest.Mock).mockResolvedValue(undefined);

            await editCourse(originalCourseData as any, newCourseData as any);

            expect(updateFullCourse).toHaveBeenCalledWith(1, [], [], mockChanges);
        });

        test('debería manejar múltiples tipos de cambios', async () => {
            const mockChanges = [
                { action: 'added', field: 'newModule', value: 'Module 1' },
                { action: 'updated', field: 'title', oldValue: 'Original', newValue: 'Updated' },
                { action: 'deleted', field: 'oldModule', value: 'Module 2' }
            ];

            (diffCourses as jest.Mock).mockReturnValue(mockChanges);
            (updateFullCourse as jest.Mock).mockResolvedValue(undefined);

            await editCourse(originalCourseData as any, newCourseData as any);

            const adds = [{ action: 'added', field: 'newModule', value: 'Module 1' }];
            const updates = [{ action: 'updated', field: 'title', oldValue: 'Original', newValue: 'Updated' }];
            const deletes = [{ action: 'deleted', field: 'oldModule', value: 'Module 2' }];

            expect(updateFullCourse).toHaveBeenCalledWith(1, adds, updates, deletes);
        });

        test('debería lanzar error si el curso no tiene ID', async () => {
            const courseWithoutId = {
                title: 'Course without ID',
                description: 'Description'
            };

            await expect(editCourse(courseWithoutId as any, newCourseData as any))
                .rejects
                .toThrow('El curso no tiene identificador valido');
        });

        test('debería manejar curso sin cambios', async () => {
            (diffCourses as jest.Mock).mockReturnValue([]);
            (updateFullCourse as jest.Mock).mockResolvedValue(undefined);

            await editCourse(originalCourseData as any, originalCourseData as any);

            expect(updateFullCourse).toHaveBeenCalledWith(1, [], [], []);
        });

        test('debería loguear y propagar errores de diffCourses', async () => {
            const error = new Error('Diff error');
            (diffCourses as jest.Mock).mockImplementation(() => {
                throw error;
            });

            await expect(editCourse(originalCourseData as any, newCourseData as any))
                .rejects
                .toThrow('Diff error');
            
            expect(logPrismaError).toHaveBeenCalledWith(error);
        });

        test('debería loguear y propagar errores de updateFullCourse', async () => {
            const mockChanges = [
                { action: 'updated', field: 'title', oldValue: 'Original', newValue: 'Updated' }
            ];
            const error = new Error('Update error');

            (diffCourses as jest.Mock).mockReturnValue(mockChanges);
            (updateFullCourse as jest.Mock).mockRejectedValue(error);

            await expect(editCourse(originalCourseData as any, newCourseData as any))
                .rejects
                .toThrow('Update error');
            
            expect(logPrismaError).toHaveBeenCalledWith(error);
        });

        test('debería filtrar correctamente los cambios por acción', async () => {
            const mockChanges = [
                { action: 'added', field: 'module1', value: 'New Module' },
                { action: 'added', field: 'module2', value: 'Another Module' },
                { action: 'updated', field: 'price', oldValue: 100, newValue: 200 },
                { action: 'deleted', field: 'oldModule', value: 'Removed Module' }
            ];

            (diffCourses as jest.Mock).mockReturnValue(mockChanges);
            (updateFullCourse as jest.Mock).mockResolvedValue(undefined);

            await editCourse(originalCourseData as any, newCourseData as any);

            const callArgs = (updateFullCourse as jest.Mock).mock.calls[0];
            expect(callArgs[1]).toHaveLength(2); // 2 added
            expect(callArgs[2]).toHaveLength(1); // 1 updated
            expect(callArgs[3]).toHaveLength(1); // 1 deleted
        });
    });

    describe('updateClassVideoPath', () => {
        test('debería actualizar la ruta del video de una clase', async () => {
            const mockUpdatedClass = {
                id: 1,
                videoPath: '/videos/new-video.mp4',
                videoSize: 1024000
            };

            (updateClass as jest.Mock).mockResolvedValue(mockUpdatedClass);

            const result = await updateClassVideoPath(1, '/videos/new-video.mp4', 1024000);

            expect(updateClass).toHaveBeenCalledWith(1, {
                videoPath: '/videos/new-video.mp4',
                videoSize: 1024000
            });
            expect(result).toEqual(mockUpdatedClass);
        });

        test('debería loguear y propagar errores', async () => {
            const error = new Error('Update failed');
            (updateClass as jest.Mock).mockRejectedValue(error);

            await expect(updateClassVideoPath(1, '/path', 1000))
                .rejects
                .toThrow('Update failed');
            
            expect(logPrismaError).toHaveBeenCalledWith(error);
        });
    });

    describe('activateCourse', () => {
        test('debería activar un curso si hay menos de 3 activos', async () => {
            (countAllActiveCourses as jest.Mock).mockResolvedValue(2);
            (updateCourse as jest.Mock).mockResolvedValue({ id: 1, isActive: true });

            const result = await activateCourse(1);

            expect(result).toEqual({
                success: true,
                message: 'Curso activado correctamente'
            });
            expect(updateCourse).toHaveBeenCalledWith(1, { isActive: true });
        });

        test('debería retornar error si ya hay 3 cursos activos', async () => {
            (countAllActiveCourses as jest.Mock).mockResolvedValue(3);

            const result = await activateCourse(1);

            expect(result).toEqual({
                success: false,
                message: 'Solo se pueden tener 3 cursos activos'
            });
            expect(updateCourse).not.toHaveBeenCalled();
        });

        test('debería retornar error si la actualización falla', async () => {
            (countAllActiveCourses as jest.Mock).mockResolvedValue(1);
            (updateCourse as jest.Mock).mockResolvedValue(null);

            const result = await activateCourse(1);

            expect(result).toEqual({
                success: false,
                message: 'No se pudo activar el curso'
            });
        });
    });

    describe('deactivateCourse', () => {
        test('debería desactivar un curso', async () => {
            (updateCourse as jest.Mock).mockResolvedValue({ id: 1, isActive: false });

            const result = await deactivateCourse(1);

            expect(result).toEqual({
                success: true,
                message: 'Curso desactivado'
            });
            expect(updateCourse).toHaveBeenCalledWith(1, { isActive: false });
        });

        test('debería retornar error si la desactivación falla', async () => {
            (updateCourse as jest.Mock).mockResolvedValue(null);

            const result = await deactivateCourse(1);

            expect(result).toEqual({
                success: false,
                message: 'No se pudo desactivar el curso'
            });
        });
    });
});
