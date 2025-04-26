"use server";

import { mapErrorToServerActionResponse } from "@/exceptions/error-encoder";
import { editUserById, registerUser } from "@/services/user";
import { EditUserData, ServerActionRequest, ServerActionResponse, UserCreateData } from "@/utils/types"
import { Middlewares } from "../server-action-middleware";
import { isAdmin } from "../middlewares/is-admin";

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
                return mapErrorToServerActionResponse(error);
            }
        });
}

export const edit = async (request: ServerActionRequest<EditUserData>): Promise<ServerActionResponse<null>> => {
    return await Middlewares<null, EditUserData>(
        request,
        [isAdmin],
        async (request: EditUserData) => {
            try {
                const user = await editUserById(request.id, request.userData);
                if (!user) {
                    return { success: false, error: "No se pudo crear el usuario." }
                }

                return { success: true, message: "Usuario creado correctamente." }
            } catch (error) {
                return mapErrorToServerActionResponse(error);
            }
        });
}