import { allCategories, createCourseCategory, deleteCourseCategory, findCategoryById, updateCourseCategory } from "@/repository/categories";
import { executeService } from "@/utils/service-wrapper";
import type { CategoryRecord, CreateCategoryCommand, UpdateCategoryCommand } from '@/application/categories/category.records';

/**
 * 
 * @returns 
 */
export const getAllCourseCategories = async (): Promise<CategoryRecord[]> => {
    return executeService(() => allCategories(), { event: 'service.category.list.failed' });
}

/**
 * 
 * @param data 
 * @returns 
 */
export const registerCourseCategory = async (data: CreateCategoryCommand): Promise<CategoryRecord> => {
    return executeService(() => createCourseCategory(data), { event: 'service.category.create.failed' });
}

/**
 * 
 * @param data 
 * @returns 
 */
export const changeCourseCategory = async (data: UpdateCategoryCommand): Promise<CategoryRecord> => {
    return executeService(() => updateCourseCategory(data), { event: 'service.category.update.failed', metadata: { categoryId: data.id } });
}

/**
 * 
 * @param id 
 * @returns 
 */
export const removeCourseCategory = async (id: number) => {
    await executeService(() => deleteCourseCategory(id), { event: 'service.category.delete.failed', metadata: { categoryId: id } });
}

/**
 * 
 * @param id 
 * @returns 
 */
export const getCategoryById = async (id: number): Promise<CategoryRecord> => {
    return executeService(() => findCategoryById(id), { event: 'service.category.get_by_id.failed', metadata: { categoryId: id } });
}
