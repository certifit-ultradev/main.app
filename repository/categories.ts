import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/exceptions/not-found";
import type { CategoryRecord, CreateCategoryCommand, UpdateCategoryCommand } from '@/application/categories/category.records';

/**
 * This repository is responsible for managing the course categories in the database.
 * It provides methods to create, update, delete and find course categories.
 */
export const allCategories = async (): Promise<CategoryRecord[]> => {
    const categories = await prisma.courseCategory.findMany();
    return categories;
}

export const findCategoryById = async (id: number): Promise<CategoryRecord> => {
    const category = await prisma.courseCategory.findFirst({
        where: { id }
    });

    if (!category) {
        throw new NotFoundError('Categoria no encontrada');
    }

    return category;
}

export const createCourseCategory = async (category: CreateCategoryCommand): Promise<CategoryRecord> => {
    const createdCourseCategory = await prisma.courseCategory.create({
        data: {
            name: category.name
        }
    });
    return createdCourseCategory;
}

export const updateCourseCategory = async (category: UpdateCategoryCommand): Promise<CategoryRecord> => {
    const updateCourseCategory = await prisma.courseCategory.update({
        where: { id: category.id },
        data: {
            name: category.name
        }
    });
    return updateCourseCategory;
}

export const deleteCourseCategory = async (id: number): Promise<CategoryRecord> => {
    const deleteCourseCategory = await prisma.courseCategory.delete({
        where: { id }
    });
    return deleteCourseCategory;
}
