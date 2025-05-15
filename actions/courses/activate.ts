"use server"

import { activateCourse } from "@/services/courses";
import { ActivateOrDeactivateCourse, ServerActionRequest, ServerActionResponse } from "@/utils/types"
import { isAdmin, isEmailVerified } from "../middlewares/middlewares";
import { Middlewares } from "../server-action-middleware";
import { mapErrorToServerActionResponse } from "@/exceptions/error-encoder";

/**
 * 
 * @param request 
 * @returns 
 */
export const activate = async (request: ServerActionRequest<ActivateOrDeactivateCourse>): Promise<ServerActionResponse<null>> => {
    return await Middlewares<null, ActivateOrDeactivateCourse>(
        request,
        [isAdmin, isEmailVerified],
        async (request: ActivateOrDeactivateCourse) => {
            try {
                const result = await activateCourse(request.id);
                if (!result) {
                    return { success: false, error: "No se pudo activar el curso, intente mas tarde." }
                }

                return { success: true, message: result.message }
            } catch (error) {
                return mapErrorToServerActionResponse(error);
            }
        }
    );
}
