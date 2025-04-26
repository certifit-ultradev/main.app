"use server";

import { changeCourseCategory, registerCourseCategory } from "@/services/categories";
import { CourseCategoryData, ServerActionRequest, ServerActionResponse } from "@/utils/types"
import { Middlewares } from "../server-action-middleware";
import { isAdmin } from "../middlewares/is-admin";

export const register = async (request: ServerActionRequest<CourseCategoryData>): Promise<ServerActionResponse<null>> => {
    return await Middlewares<null, CourseCategoryData>(
        request,
        [isAdmin],
        async (data: CourseCategoryData) => {
            const user = await registerCourseCategory(data);
            if (!user) {
                return { success: false, error: "No se pudo crear la categoria." }
            }

            return { success: true, message: "Categoria creada correctamente." }
        }
    );
}

export const edit = async (request: ServerActionRequest<Partial<CourseCategoryData>>) => {
    return await Middlewares<null, Partial<CourseCategoryData>>(
        request,
        [isAdmin],
        async (data: Partial<CourseCategoryData>) => {
            const category = await changeCourseCategory({ ...data });
            if (!category) {
                return { success: false, error: "No se pudo crear la categoria." }
            }

            return { success: true, message: "Categoria creado correctamente." }
        }
    );
}