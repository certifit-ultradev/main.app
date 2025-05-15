"use server"

import { deactivateCourse } from "@/services/courses";
import { ActivateOrDeactivateCourse, ServerActionRequest, ServerActionResponse } from "@/utils/types"
import { Middlewares } from "../server-action-middleware";
import { isAdmin, isEmailVerified } from "../middlewares/middlewares";
import { mapErrorToServerActionResponse } from "@/exceptions/error-encoder";

/**
 * 
 * @param request 
 * @returns 
 */
export const deactivate = async (request: ServerActionRequest<ActivateOrDeactivateCourse>): Promise<ServerActionResponse<null>> => {
    return await Middlewares<null, ActivateOrDeactivateCourse>(
        request,
        [isAdmin, isEmailVerified],
        async (request: ActivateOrDeactivateCourse) => {
            try {
                if (!await deactivateCourse(request.id)) {
                    return { success: false, error: "No se pudo desactivar el curso, intente mas tarde." }
                }

                return { success: true, message: "Curso desactivado correctamente" }
            } catch (error) {
                return mapErrorToServerActionResponse(error);
            }
        }
    );
}
