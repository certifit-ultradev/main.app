import { allCategories, createCourseCategory, deleteCourseCategory, findCategoryById, updateCourseCategory } from "@/repository/categories";
import { executeService } from "@/utils/service-wrapper";
import type { CategoryRecord, CreateCategoryCommand, UpdateCategoryCommand } from '@/application/categories/category.records';

/**
 * 
 * @returns 
 */
export const getAllCourseCategories = async (): Promise<CategoryRecord[]> => {
    return executeService(() => allCategories());
}

/**
 * 
 * @param data 
 * @returns 
 */
export const registerCourseCategory = async (data: CreateCategoryCommand): Promise<CategoryRecord> => {
    return executeService(() => createCourseCategory(data));
}

/**
 * 
 * @param data 
 * @returns 
 */
export const changeCourseCategory = async (data: UpdateCategoryCommand): Promise<CategoryRecord> => {
    return executeService(() => updateCourseCategory(data));
}

/**
 * 
 * @param id 
 * @returns 
 */
export const removeCourseCategory = async (id: number) => {
    await executeService(() => deleteCourseCategory(id));
}

/**
 * 
 * @param id 
 * @returns 
 */
export const getCategoryById = async (id: number): Promise<CategoryRecord> => {
    return executeService(() => findCategoryById(id));
}
