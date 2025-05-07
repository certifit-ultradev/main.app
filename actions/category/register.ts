"use server";

import { changeCourseCategory, registerCourseCategory, removeCourseCategory } from "@/services/categories";
import { CourseCategoryData, ServerActionRequest, ServerActionResponse } from "@/utils/types"
import { Middlewares } from "../server-action-middleware";
import { isAdmin, isEmailVerified } from "../middlewares/middlewares";
import { mapErrorToServerActionResponse } from "@/exceptions/error-encoder";

export const register = async (request: ServerActionRequest<CourseCategoryData>): Promise<ServerActionResponse<null>> => {
    return await Middlewares<null, CourseCategoryData>(
        request,
        [isAdmin, isEmailVerified],
        async (data: CourseCategoryData) => {
            try {
                const user = await registerCourseCategory(data);
                if (!user) {
                    return { success: false, error: "No se pudo crear la categoria." }
                }

                return { success: true, message: "Categoria creada correctamente." }
            } catch (error) {
                return mapErrorToServerActionResponse(error);
            }
        }
    );
}

export const edit = async (request: ServerActionRequest<Partial<CourseCategoryData>>) => {
    return await Middlewares<null, Partial<CourseCategoryData>>(
        request,
        [isAdmin],
        async (data: Partial<CourseCategoryData>) => {
            try {
                const category = await changeCourseCategory({ ...data });
                if (!category) {
                    return { success: false, error: "No se pudo crear la categoria." }
                }

                return { success: true, message: "Categoria creado correctamente." }
            } catch (error) {
                return mapErrorToServerActionResponse(error);
            }
        }
    );
}

export const deleteCategory = async (request: ServerActionRequest<{ id: number }>) => {
    return await Middlewares<null, { id: number }>(
        request,
        [isAdmin],
        async (request: { id: number }) => {
            try {
                await removeCourseCategory(request.id);
                return { success: true, message: "Categoria eliminada correctamente." }
            } catch (error) {
                return mapErrorToServerActionResponse(error);
            }
        }
    );
}
