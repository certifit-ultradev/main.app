import { NotFoundError } from '@/exceptions/not-found';
import { prisma } from '@/lib/prisma';
import {
    allCategories,
    createCourseCategory,
    deleteCourseCategory,
    findCategoryById,
    updateCourseCategory,
} from '@/repository/categories';

jest.mock('@/lib/prisma', () => ({
    prisma: {
        courseCategory: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

describe('category repository records', () => {
    const record = { id: 1, name: 'Desarrollo web' };

    beforeEach(() => jest.clearAllMocks());

    it('returns persisted records without constructing CourseCategory', async () => {
        (prisma.courseCategory.findMany as jest.Mock).mockResolvedValue([record]);
        await expect(allCategories()).resolves.toEqual([record]);
    });

    it('returns a record or preserves not-found semantics', async () => {
        (prisma.courseCategory.findFirst as jest.Mock).mockResolvedValue(record);
        await expect(findCategoryById(1)).resolves.toEqual(record);

        (prisma.courseCategory.findFirst as jest.Mock).mockResolvedValue(null);
        await expect(findCategoryById(404)).rejects.toThrow(NotFoundError);
    });

    it('accepts explicit create and update commands', async () => {
        (prisma.courseCategory.create as jest.Mock).mockResolvedValue(record);
        (prisma.courseCategory.update as jest.Mock).mockResolvedValue({ id: 1, name: 'Datos' });

        await expect(createCourseCategory({ name: record.name })).resolves.toEqual(record);
        await expect(updateCourseCategory({ id: 1, name: 'Datos' })).resolves.toEqual({ id: 1, name: 'Datos' });
        expect(prisma.courseCategory.create).toHaveBeenCalledWith({ data: { name: record.name } });
        expect(prisma.courseCategory.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { name: 'Datos' } });
    });

    it('deletes by category id', async () => {
        (prisma.courseCategory.delete as jest.Mock).mockResolvedValue(record);
        await expect(deleteCourseCategory(1)).resolves.toEqual(record);
    });
});
