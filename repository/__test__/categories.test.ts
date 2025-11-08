import { CourseCategory } from "@/models/course-category";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/exceptions/not-found";
import {
    allCategories,
    findCategoryById,
    createCourseCategory,
    updateCourseCategory,
    deleteCourseCategory
} from '@/repository/categories';

jest.mock('@/lib/prisma', () => ({
    prisma: {
        courseCategory: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        }
    }
}));

jest.mock('@/models/course-category');

describe('Categories Repository Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('allCategories', () => {
        test('debería retornar un array vacío cuando no hay categorías', async () => {
            (prisma.courseCategory.findMany as jest.Mock).mockResolvedValue([]);

            const result = await allCategories();

            expect(prisma.courseCategory.findMany).toHaveBeenCalledTimes(1);
            expect(result).toEqual([]);
        });

        test('debería retornar un array de CourseCategory cuando hay categorías', async () => {
            const mockCategories = [
                { id: 1, name: 'Categoría 1' },
                { id: 2, name: 'Categoría 2' }
            ];
            const mockCourseCategoryInstances = [
                { id: 1, name: 'Categoría 1' },
                { id: 2, name: 'Categoría 2' }
            ];

            (prisma.courseCategory.findMany as jest.Mock).mockResolvedValue(mockCategories);
            (CourseCategory as jest.Mock)
                .mockImplementationOnce(() => mockCourseCategoryInstances[0])
                .mockImplementationOnce(() => mockCourseCategoryInstances[1]);

            const result = await allCategories();

            expect(prisma.courseCategory.findMany).toHaveBeenCalledTimes(1);
            expect(CourseCategory).toHaveBeenCalledTimes(2);
            expect(result).toHaveLength(2);
        });
    });

    describe('findCategoryById', () => {
        test('debería retornar una categoría cuando existe', async () => {
            const mockCategory = { id: 1, name: 'Categoría Test' };
            (prisma.courseCategory.findFirst as jest.Mock).mockResolvedValue(mockCategory);

            const result = await findCategoryById(1);

            expect(prisma.courseCategory.findFirst).toHaveBeenCalledWith({
                where: { id: 1 }
            });
            expect(result).toEqual({
                id: 1,
                name: 'Categoría Test'
            });
        });

        test('debería lanzar NotFoundError cuando la categoría no existe', async () => {
            (prisma.courseCategory.findFirst as jest.Mock).mockResolvedValue(null);

            await expect(findCategoryById(999)).rejects.toThrow(NotFoundError);
            await expect(findCategoryById(999)).rejects.toThrow('Recurso no encontrado');
            expect(prisma.courseCategory.findFirst).toHaveBeenCalledWith({
                where: { id: 999 }
            });
        });
    });

    describe('createCourseCategory', () => {
        test('debería crear y retornar una nueva categoría', async () => {
            const newCategory = { name: 'Nueva Categoría' } as CourseCategory;
            const mockCreatedCategory = { id: 1, name: 'Nueva Categoría' };

            (prisma.courseCategory.create as jest.Mock).mockResolvedValue(mockCreatedCategory);

            const result = await createCourseCategory(newCategory);

            expect(prisma.courseCategory.create).toHaveBeenCalledWith({
                data: {
                    name: 'Nueva Categoría'
                }
            });
            expect(result).toEqual(mockCreatedCategory);
        });
    });

    describe('updateCourseCategory', () => {
        test('debería actualizar y retornar la categoría actualizada', async () => {
            const categoryToUpdate = { id: 1, name: 'Categoría Actualizada' } as CourseCategory;
            const mockUpdatedCategory = { id: 1, name: 'Categoría Actualizada' };

            (prisma.courseCategory.update as jest.Mock).mockResolvedValue(mockUpdatedCategory);

            const result = await updateCourseCategory(categoryToUpdate);

            expect(prisma.courseCategory.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: {
                    name: 'Categoría Actualizada'
                }
            });
            expect(result).toEqual(mockUpdatedCategory);
        });
    });

    describe('deleteCourseCategory', () => {
        test('debería eliminar y retornar la categoría eliminada', async () => {
            const mockDeletedCategory = { id: 1, name: 'Categoría Eliminada' };

            (prisma.courseCategory.delete as jest.Mock).mockResolvedValue(mockDeletedCategory);

            const result = await deleteCourseCategory(1);

            expect(prisma.courseCategory.delete).toHaveBeenCalledWith({
                where: { id: 1 }
            });
            expect(result).toEqual(mockDeletedCategory);
        });
    });
});