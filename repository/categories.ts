import { CourseCategory } from "@/models/course-category";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/exceptions/not-found";

/**
 * This repository is responsible for managing the course categories in the database.
 * It provides methods to create, update, delete and find course categories.
 */
export const allCategories = async (): Promise<CourseCategory[]> => {
    const categories = await prisma.courseCategory.findMany();
    if (categories.length == 0) {
        return [];
    }

    return categories.map<CourseCategory>((category) => {
        return new CourseCategory({ ...category });
    })
}

export const findCategoryById = async (id: number): Promise<CourseCategory> => {
    const category = await prisma.courseCategory.findFirst({
        where: { id }
    });

    if (!category) {
        throw new NotFoundError('Categoria no encontrada');
    }

    return {
        id: category?.id,
        name: category?.name
    };
}

export const createCourseCategory = async (category: CourseCategory): Promise<CourseCategory> => {
    const createdCourseCategory = await prisma.courseCategory.create({
        data: {
            name: category.name
        }
    });
    return createdCourseCategory;
}

export const updateCourseCategory = async (category: CourseCategory): Promise<CourseCategory> => {
    const updateCourseCategory = await prisma.courseCategory.update({
        where: { id: category.id },
        data: {
            name: category.name
        }
    });
    return updateCourseCategory;
}

export const deleteCourseCategory = async (id: number): Promise<CourseCategory> => {
    const deleteCourseCategory = await prisma.courseCategory.delete({
        where: { id }
    });
    return deleteCourseCategory;
}