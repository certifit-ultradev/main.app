"use server";

import { getUserByEmail, getUserById } from "@/services/user"
import { FetchUserByEmail, FetchUserByID, ServerActionRequest, ServerActionResponse, UserList } from "@/utils/types";
import { isAdmin, isEmailVerified } from "../middlewares/middlewares";
import { Middlewares } from "../server-action-middleware";
import { mapErrorToServerActionResponse } from "@/exceptions/error-encoder";

export const fetchUserByEmail = async (request: ServerActionRequest<FetchUserByEmail>): Promise<ServerActionResponse<null>> => {
    return await Middlewares<null, FetchUserByEmail>(
        request,
        [isAdmin, isEmailVerified],
        async (data: FetchUserByEmail) => {
            try {
                const existingUser = await getUserByEmail(data.email);
                if (existingUser) {
                    return {
                        success: false,
                        message: 'Si ya tienes una cuenta, por favor inicia sesión.',
                    };
                }

                return { success: true };
            } catch (error) {
                console.error('Error al verificar el correo electrónico:', error);
                return {
                    success: false,
                    message: 'Ocurrió un error al procesar tu solicitud.',
                };
            }
        }
    );
}

export const fetchUserById = async (request: ServerActionRequest<FetchUserByID>): Promise<ServerActionResponse<UserList>> => {
    return await Middlewares<UserList, FetchUserByID>(
        request,
        [isAdmin, isEmailVerified],
        async (data: FetchUserByID) => {
            try {
                const existingUser = await getUserById(data.id);
                if (!existingUser) {
                    return {
                        success: false,
                        message: 'El usuario no existe',
                    };
                }
                return {
                    success: true,
                    payload: {
                        id: existingUser.id,
                        name: existingUser.name,
                        lastName: existingUser.lastName,
                        email: existingUser.email,
                        phoneNumber: existingUser.phoneNumber,
                        isAdmin: existingUser.isAdmin,
                        emailVerified: existingUser.emailVerified,
                        createdAt: existingUser.createdAt,
                        updatedAt: existingUser.updatedAt
                    }
                };
            } catch (error) {
                return mapErrorToServerActionResponse(error);
            }
        }
    );
}

