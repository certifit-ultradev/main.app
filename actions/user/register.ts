"use server";

import { mapErrorToServerActionResponse } from "@/exceptions/error-encoder";
import { editUserById, registerUser } from "@/services/user";
import { EditUserData, ServerActionRequest, ServerActionResponse, UserCreateData } from "@/utils/types"
import { Middlewares } from "../server-action-middleware";
import { isAdmin, isEmailVerified } from "../middlewares/middlewares";
import { cleanData } from "@/utils/filter-data";

/**
 * 
 * @param request 
 * @returns 
 */
export const register = async (request: ServerActionRequest<UserCreateData>): Promise<ServerActionResponse<null>> => {
    return await Middlewares<null, UserCreateData>(
        request,
        [isAdmin],
        async (request: UserCreateData) => {
            try {
                const user = await registerUser(request);
                if (!user) {
                    return { success: false, error: "No se pudo crear el usuario." }
                }

                return { success: true, message: "Usuario creado correctamente." }
            } catch (error) {
                return mapErrorToServerActionResponse(error, true);
            }
        });
}

/**
 * 
 * @param request 
 * @returns 
 */
export const edit = async (request: ServerActionRequest<EditUserData>): Promise<ServerActionResponse<null>> => {
    return await Middlewares<null, EditUserData>(
        request,
        [isAdmin],
        async (request: EditUserData) => {
            try {
                if (request.userData.password !== request.userData.confirmPassword) {
                    return { success: false, error: "Las contraseñas no coinciden." }
                }

                delete request.userData.confirmPassword;
                const filteredData = cleanData(request.userData);
                const user = await editUserById(request.id, filteredData);
                if (!user) {
                    return { success: false, error: "No se pudo crear el usuario." }
                }

                return { success: true, message: "Usuario creado correctamente." }
            } catch (error) {
                return mapErrorToServerActionResponse(error, true);
            }
        });
}

/**
 * 
 * @param request 
 * @returns 
 */
export const activate = async (request: ServerActionRequest<{ id: string }>): Promise<ServerActionResponse<null>> => {
    return await Middlewares<null, { id: string }>(
        request,
        [isAdmin],
        async (request: { id: string }) => {
            try {
                const user = await editUserById(request.id, { emailVerified: new Date() });
                if (!user) {
                    return { success: false, error: "No se pudo activar el usuario." }
                }
                return { success: true, message: "Usuario activado correctamente." }
            } catch (error) {
                return mapErrorToServerActionResponse(error, true);
            }
        });
}

/**
 * 
 * @param request 
 * @returns 
 */
export const deactivate = async (request: ServerActionRequest<{ id: string }>): Promise<ServerActionResponse<null>> => {
    return await Middlewares<null, { id: string }>(
        request,
        [isAdmin, isEmailVerified],
        async (request: { id: string }) => {
            try {
                const user = await editUserById(request.id, { emailVerified: null });
                if (!user) {
                    return { success: false, error: "No se pudo desactiar el usuario." }
                }
                return { success: true, message: "Usuario desactivado correctamente." }
            } catch (error) {
                return mapErrorToServerActionResponse(error, true);
            }
        });
}