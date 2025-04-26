import { logPrismaError } from "@/exceptions/error-encoder";
import { CourseCategory } from "@/models/course-category";
import { allCategories, createCourseCategory, findCategoryById, updateCourseCategory } from "@/repository/categories";
import { CourseCategoryData } from "@/utils/types";

export const getAllCourseCategories = async (): Promise<CourseCategory[]> => {
    try {
        return await allCategories();
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

export const registerCourseCategory = async (data: CourseCategoryData): Promise<CourseCategory | null> => {
    try {
        return await createCourseCategory(new CourseCategory({
            name: data.name
        }));
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

export const changeCourseCategory = async (data: Partial<CourseCategoryData>): Promise<CourseCategory | null> => {
    try {
        return await updateCourseCategory(new CourseCategory({
            id: data.id,
            name: data.name
        }));
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

export const getCategoryById = async (id: number): Promise<CourseCategory> => {
    try {
        return await findCategoryById(id);
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}
