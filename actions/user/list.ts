"use server";

import { getAllUsers } from "@/services/user";
import { DataPaginated, FetchPage, ServerActionRequest, ServerActionResponse, UserList } from "@/utils/types";
import { Middlewares } from "../server-action-middleware";
import { isAdmin, isEmailVerified } from "../middlewares/middlewares";
import { mapErrorToServerActionResponse } from "@/exceptions/error-encoder";

/**
 * 
 * @param request 
 * @returns 
 */
export const listAll = async (request: ServerActionRequest<FetchPage>): Promise<ServerActionResponse<DataPaginated<UserList>>> => {
    return await Middlewares<DataPaginated<UserList>, FetchPage>(
        request,
        [isAdmin, isEmailVerified],
        async (request: FetchPage) => {
            try {
                const usersPaged = await getAllUsers({ page:request.page });
                if (!usersPaged) {
                    return {
                        success: false,
                        payload: {
                            data: [],
                            page: 1,
                            lastPage: 1,
                            total: 0
                        }
                    }
                };
                return {
                    success: true,
                    payload: {
                        ...usersPaged,
                        data: usersPaged.data.map<UserList>((user) => ({
                            id: user.id,
                            name: user.name,
                            lastName: user.lastName,
                            email: user.email,
                            phoneNumber: user.phoneNumber,
                            isAdmin: user.isAdmin,
                            emailVerified: user.emailVerified,
                            createdAt: user.createdAt,
                            updatedAt: user.updatedAt
                        })),
                    }
                };
            } catch (error) {
                return mapErrorToServerActionResponse(error);
            }
        })
}
