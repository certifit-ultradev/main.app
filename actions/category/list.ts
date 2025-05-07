"use server";

import { getAllCourseCategories, getCategoryById } from "@/services/categories";
import { CourseCategoryData, FetchCategory, ServerActionRequest, ServerActionResponse } from "@/utils/types";
import { Middlewares } from "../server-action-middleware";
import { isAdmin, isEmailVerified } from "../middlewares/middlewares";
import { mapErrorToServerActionResponse } from "@/exceptions/error-encoder";

export const listAllCourseCategories = async (): Promise<ServerActionResponse<CourseCategoryData[]>> => {
    return await Middlewares<CourseCategoryData[], null>(
        { data: null },
        [isAdmin, isEmailVerified],
        async () => {
            try {
                const courseCategories = await getAllCourseCategories();
                if (!courseCategories) {
                    return {
                        success: false,
                        payload: []
                    };
                }

                return {
                    success: true,
                    payload: courseCategories.map<CourseCategoryData>((category) => {
                        return { ...category };
                    })
                };
            } catch (error) {
                return mapErrorToServerActionResponse(error);
            }
        });
}

export async function fetchCategoryById(
    request: ServerActionRequest<FetchCategory>
): Promise<ServerActionResponse<CourseCategoryData>> {
    return await Middlewares<CourseCategoryData, FetchCategory>(
        request,
        [isAdmin], // Array de middlewares
        async (fetchCategory: FetchCategory) => {
            try {
                const courseCategory = await getCategoryById(fetchCategory.id);
                if (!courseCategory) {
                    return {
                        success: false,
                        message: 'La categoria no existe',
                    };
                }

                return {
                    success: true,
                    payload: {
                        ...courseCategory
                    }
                }
            } catch (error) {
                return mapErrorToServerActionResponse(error);
            }
        });
};
