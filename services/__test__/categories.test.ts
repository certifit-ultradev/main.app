import { logPrismaError } from "@/exceptions/error-encoder";
import { CourseCategory } from "@/models/course-category";
import {
    allCategories,
    createCourseCategory,
    deleteCourseCategory,
    findCategoryById,
    updateCourseCategory
} from "@/repository/categories";
import {
    getAllCourseCategories,
    registerCourseCategory,
    changeCourseCategory,
    removeCourseCategory,
    getCategoryById
} from '@/services/categories';
import { CourseCategoryData } from "@/utils/types";

jest.mock('@/repository/categories');
jest.mock('@/exceptions/error-encoder');
jest.mock('@/models/course-category');

describe('Categories Service Tests', () => {
    beforeEach(() => {
        (logPrismaError as jest.Mock).mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllCourseCategories', () => {
        test('debería retornar todas las categorías de cursos', async () => {
            const mockCategories = [
                { id: 1, name: 'Desarrollo Web' },
                { id: 2, name: 'Data Science' },
                { id: 3, name: 'Mobile Development' }
            ];

            (allCategories as jest.Mock).mockResolvedValue(mockCategories);

            const result = await getAllCourseCategories();

            expect(allCategories).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockCategories);
        });

        test('debería retornar array vacío cuando no hay categorías', async () => {
            (allCategories as jest.Mock).mockResolvedValue([]);

            const result = await getAllCourseCategories();

            expect(result).toEqual([]);
            expect(allCategories).toHaveBeenCalledTimes(1);
        });

        test('debería loguear y propagar errores del repositorio', async () => {
            const error = new Error('Database error');
            (allCategories as jest.Mock).mockRejectedValue(error);

            await expect(getAllCourseCategories()).rejects.toThrow('Database error');
            
            expect(logPrismaError).toHaveBeenCalledWith(error);
            expect(logPrismaError).toHaveBeenCalledTimes(1);
        });

        test('debería retornar múltiples categorías correctamente', async () => {
            const mockCategories = Array.from({ length: 10 }, (_, i) => ({
                id: i + 1,
                name: `Categoría ${i + 1}`
            }));

            (allCategories as jest.Mock).mockResolvedValue(mockCategories);

            const result = await getAllCourseCategories();

            expect(result).toHaveLength(10);
            expect(result[0].name).toBe('Categoría 1');
            expect(result[9].name).toBe('Categoría 10');
        });
    });

    describe('registerCourseCategory', () => {
        test('debería crear una nueva categoría de curso', async () => {
            const categoryData: CourseCategoryData = {
                name: 'Nueva Categoría'
            };

            const mockCreatedCategory = {
                id: 1,
                name: 'Nueva Categoría'
            };

            (CourseCategory as jest.Mock).mockImplementation((data) => data);
            (createCourseCategory as jest.Mock).mockResolvedValue(mockCreatedCategory);

            const result = await registerCourseCategory(categoryData);

            expect(CourseCategory).toHaveBeenCalledWith({
                name: 'Nueva Categoría'
            });
            expect(createCourseCategory).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockCreatedCategory);
        });

        test('debería retornar null si la creación falla', async () => {
            const categoryData: CourseCategoryData = {
                name: 'Categoría Fallida'
            };

            (CourseCategory as jest.Mock).mockImplementation((data) => data);
            (createCourseCategory as jest.Mock).mockResolvedValue(null);

            const result = await registerCourseCategory(categoryData);

            expect(result).toBeNull();
        });

        test('debería loguear y propagar errores durante la creación', async () => {
            const categoryData: CourseCategoryData = {
                name: 'Categoría Error'
            };

            const error = new Error('Creation failed');
            (CourseCategory as jest.Mock).mockImplementation((data) => data);
            (createCourseCategory as jest.Mock).mockRejectedValue(error);

            await expect(registerCourseCategory(categoryData))
                .rejects
                .toThrow('Creation failed');
            
            expect(logPrismaError).toHaveBeenCalledWith(error);
        });

        test('debería crear categorías con diferentes nombres', async () => {
            const categoryNames = [
                'Backend Development',
                'Frontend Development',
                'DevOps',
                'Cloud Computing'
            ];

            (CourseCategory as jest.Mock).mockImplementation((data) => data);

            for (const name of categoryNames) {
                const mockCreated = { id: 1, name };
                (createCourseCategory as jest.Mock).mockResolvedValue(mockCreated);

                const result = await registerCourseCategory({ name });

                expect(result?.name).toBe(name);
            }
        });

        test('debería pasar el nombre correctamente al modelo CourseCategory', async () => {
            const categoryData: CourseCategoryData = {
                name: 'Verificación de Nombre'
            };

            (CourseCategory as jest.Mock).mockImplementation((data) => data);
            (createCourseCategory as jest.Mock).mockResolvedValue({
                id: 1,
                name: categoryData.name
            });

            await registerCourseCategory(categoryData);

            expect(CourseCategory).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Verificación de Nombre'
                })
            );
        });
    });

    describe('changeCourseCategory', () => {
        test('debería actualizar una categoría existente', async () => {
            const categoryData: Partial<CourseCategoryData> = {
                id: 1,
                name: 'Categoría Actualizada'
            };

            const mockUpdatedCategory = {
                id: 1,
                name: 'Categoría Actualizada'
            };

            (CourseCategory as jest.Mock).mockImplementation((data) => data);
            (updateCourseCategory as jest.Mock).mockResolvedValue(mockUpdatedCategory);

            const result = await changeCourseCategory(categoryData);

            expect(CourseCategory).toHaveBeenCalledWith({
                id: 1,
                name: 'Categoría Actualizada'
            });
            expect(updateCourseCategory).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockUpdatedCategory);
        });

        test('debería retornar null si la actualización falla', async () => {
            const categoryData: Partial<CourseCategoryData> = {
                id: 999,
                name: 'No Existe'
            };

            (CourseCategory as jest.Mock).mockImplementation((data) => data);
            (updateCourseCategory as jest.Mock).mockResolvedValue(null);

            const result = await changeCourseCategory(categoryData);

            expect(result).toBeNull();
        });

        test('debería loguear y propagar errores durante la actualización', async () => {
            const categoryData: Partial<CourseCategoryData> = {
                id: 1,
                name: 'Error Update'
            };

            const error = new Error('Update failed');
            (CourseCategory as jest.Mock).mockImplementation((data) => data);
            (updateCourseCategory as jest.Mock).mockRejectedValue(error);

            await expect(changeCourseCategory(categoryData))
                .rejects
                .toThrow('Update failed');
            
            expect(logPrismaError).toHaveBeenCalledWith(error);
        });

        test('debería manejar actualizaciones con id y name', async () => {
            const updateData = [
                { id: 1, name: 'Actualización 1' },
                { id: 2, name: 'Actualización 2' },
                { id: 3, name: 'Actualización 3' }
            ];

            (CourseCategory as jest.Mock).mockImplementation((data) => data);

            for (const data of updateData) {
                (updateCourseCategory as jest.Mock).mockResolvedValue(data);

                const result = await changeCourseCategory(data);

                expect(result).toMatchObject({
                    id: data.id,
                    name: data.name
                });
            }
        });

        test('debería pasar correctamente id y name al modelo', async () => {
            const categoryData: Partial<CourseCategoryData> = {
                id: 5,
                name: 'Test Category Update'
            };

            (CourseCategory as jest.Mock).mockImplementation((data) => data);
            (updateCourseCategory as jest.Mock).mockResolvedValue({
                id: 5,
                name: 'Test Category Update'
            });

            await changeCourseCategory(categoryData);

            expect(CourseCategory).toHaveBeenCalledWith({
                id: 5,
                name: 'Test Category Update'
            });
        });
    });

    describe('removeCourseCategory', () => {
        test('debería eliminar una categoría por ID', async () => {
            const categoryId = 1;

            (deleteCourseCategory as jest.Mock).mockResolvedValue({
                id: categoryId,
                name: 'Categoría Eliminada'
            });

            await removeCourseCategory(categoryId);

            expect(deleteCourseCategory).toHaveBeenCalledWith(categoryId);
            expect(deleteCourseCategory).toHaveBeenCalledTimes(1);
        });

        test('debería loguear y propagar errores durante la eliminación', async () => {
            const categoryId = 999;
            const error = new Error('Delete failed');

            (deleteCourseCategory as jest.Mock).mockRejectedValue(error);

            await expect(removeCourseCategory(categoryId))
                .rejects
                .toThrow('Delete failed');
            
            expect(logPrismaError).toHaveBeenCalledWith(error);
        });

        test('debería eliminar múltiples categorías correctamente', async () => {
            const categoryIds = [1, 2, 3, 4, 5];

            for (const id of categoryIds) {
                (deleteCourseCategory as jest.Mock).mockResolvedValue({
                    id,
                    name: `Categoría ${id}`
                });

                await removeCourseCategory(id);

                expect(deleteCourseCategory).toHaveBeenCalledWith(id);
            }

            expect(deleteCourseCategory).toHaveBeenCalledTimes(categoryIds.length);
        });

        test('debería ser void (no retornar valor)', async () => {
            const categoryId = 10;

            (deleteCourseCategory as jest.Mock).mockResolvedValue({
                id: categoryId,
                name: 'Test'
            });

            const result = await removeCourseCategory(categoryId);

            expect(result).toBeUndefined();
        });

        test('debería manejar errores de categoría no encontrada', async () => {
            const categoryId = 404;
            const error = new Error('Category not found');

            (deleteCourseCategory as jest.Mock).mockRejectedValue(error);

            await expect(removeCourseCategory(categoryId))
                .rejects
                .toThrow('Category not found');
            
            expect(deleteCourseCategory).toHaveBeenCalledWith(categoryId);
            expect(logPrismaError).toHaveBeenCalledWith(error);
        });
    });

    describe('getCategoryById', () => {
        test('debería retornar una categoría por su ID', async () => {
            const categoryId = 1;
            const mockCategory = {
                id: categoryId,
                name: 'Categoría Encontrada'
            };

            (findCategoryById as jest.Mock).mockResolvedValue(mockCategory);

            const result = await getCategoryById(categoryId);

            expect(findCategoryById).toHaveBeenCalledWith(categoryId);
            expect(result).toEqual(mockCategory);
        });

        test('debería loguear y propagar errores cuando no se encuentra la categoría', async () => {
            const categoryId = 999;
            const error = new Error('Category not found');

            (findCategoryById as jest.Mock).mockRejectedValue(error);

            await expect(getCategoryById(categoryId))
                .rejects
                .toThrow('Category not found');
            
            expect(logPrismaError).toHaveBeenCalledWith(error);
        });

        test('debería buscar diferentes categorías por ID', async () => {
            const testCases = [
                { id: 1, name: 'Web Development' },
                { id: 2, name: 'Mobile Development' },
                { id: 3, name: 'Data Science' }
            ];

            for (const testCase of testCases) {
                (findCategoryById as jest.Mock).mockResolvedValue(testCase);

                const result = await getCategoryById(testCase.id);

                expect(result).toMatchObject({
                    id: testCase.id,
                    name: testCase.name
                });
                expect(findCategoryById).toHaveBeenCalledWith(testCase.id);
            }
        });

        test('debería llamar al repositorio con el ID correcto', async () => {
            const categoryId = 42;
            const mockCategory = {
                id: categoryId,
                name: 'Test Category'
            };

            (findCategoryById as jest.Mock).mockResolvedValue(mockCategory);

            await getCategoryById(categoryId);

            expect(findCategoryById).toHaveBeenCalledWith(42);
            expect(findCategoryById).toHaveBeenCalledTimes(1);
        });

        test('debería manejar errores de base de datos', async () => {
            const categoryId = 1;
            const dbError = new Error('Database connection failed');

            (findCategoryById as jest.Mock).mockRejectedValue(dbError);

            await expect(getCategoryById(categoryId))
                .rejects
                .toThrow('Database connection failed');
            
            expect(logPrismaError).toHaveBeenCalledWith(dbError);
        });

        test('debería retornar CourseCategory con la estructura correcta', async () => {
            const categoryId = 7;
            const mockCategory = {
                id: 7,
                name: 'Structured Category'
            };

            (findCategoryById as jest.Mock).mockResolvedValue(mockCategory);

            const result = await getCategoryById(categoryId);

            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('name');
            expect(result.id).toBe(7);
            expect(result.name).toBe('Structured Category');
        });
    });

    describe('Error handling consistency', () => {
        test('todas las funciones deberían loguear errores con logPrismaError', async () => {
            const error = new Error('Test error');

            // Test getAllCourseCategories
            (allCategories as jest.Mock).mockRejectedValue(error);
            await expect(getAllCourseCategories()).rejects.toThrow();
            expect(logPrismaError).toHaveBeenCalledWith(error);

            // Test registerCourseCategory
            (CourseCategory as jest.Mock).mockImplementation((data) => data);
            (createCourseCategory as jest.Mock).mockRejectedValue(error);
            await expect(registerCourseCategory({ name: 'Test' })).rejects.toThrow();
            expect(logPrismaError).toHaveBeenCalledWith(error);

            // Test changeCourseCategory
            (updateCourseCategory as jest.Mock).mockRejectedValue(error);
            await expect(changeCourseCategory({ id: 1, name: 'Test' })).rejects.toThrow();
            expect(logPrismaError).toHaveBeenCalledWith(error);

            // Test removeCourseCategory
            (deleteCourseCategory as jest.Mock).mockRejectedValue(error);
            await expect(removeCourseCategory(1)).rejects.toThrow();
            expect(logPrismaError).toHaveBeenCalledWith(error);

            // Test getCategoryById
            (findCategoryById as jest.Mock).mockRejectedValue(error);
            await expect(getCategoryById(1)).rejects.toThrow();
            expect(logPrismaError).toHaveBeenCalledWith(error);
        });

        test('todas las funciones deberían propagar los errores después de loguearlos', async () => {
            const customError = new Error('Custom error message');

            const functions = [
                { fn: getAllCourseCategories, mock: allCategories },
                { fn: () => registerCourseCategory({ name: 'Test' }), mock: createCourseCategory, setup: () => (CourseCategory as jest.Mock).mockImplementation((data) => data) },
                { fn: () => changeCourseCategory({ id: 1, name: 'Test' }), mock: updateCourseCategory, setup: () => (CourseCategory as jest.Mock).mockImplementation((data) => data) },
                { fn: () => removeCourseCategory(1), mock: deleteCourseCategory },
                { fn: () => getCategoryById(1), mock: findCategoryById }
            ];

            for (const { fn, mock, setup } of functions) {
                if (setup) setup();
                (mock as jest.Mock).mockRejectedValue(customError);
                
                await expect(fn()).rejects.toThrow('Custom error message');
            }
        });
    });
});
