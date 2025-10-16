import { DataPaginated, RegisterUser, RequestDataPaginated, UserCreateData } from "@/utils/types"
import { User } from "@/models/user"
import { allUsers, countAllUsers, createUser, findUserByEmail, findUserById, findUserByPhoneNumber, updateUserById } from "@/repository/users"
import { logPrismaError } from "@/exceptions/error-encoder";

export const USERS_PAGE_SIZE = 10;

/**
 * 
 * @param page 
 * @returns 
 */
export const getAllUsers = async (request: RequestDataPaginated): Promise<DataPaginated<User>> => {
    try {
        const pagedUsers = await allUsers(request.page, USERS_PAGE_SIZE);
        const totalUsers = await countAllUsers();
        const totalPages = Math.ceil(totalUsers / USERS_PAGE_SIZE);

        return {
            data: pagedUsers,
            page: request.page,
            lastPage: totalPages,
            total: totalPages
        }
    } catch (error) {
        logPrismaError(error);
        return {
            data: [],
            page: 1,
            lastPage: 1,
            total: 0
        };
    }
}

/**
 * 
 * @param id 
 * @returns 
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
    try {
        return await findUserByEmail(email)
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @param phoneNumber 
 * @returns 
 */
export const getUserByPhoneNumber = async (phoneNumber: string): Promise<User | null> => {
    try {
        return await findUserByPhoneNumber(phoneNumber);
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @param id 
 * @returns 
 */
export const getUserById = async (id: string): Promise<User | null> => {
    try {
        return await findUserById(id);
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @param userInfo 
 * @returns 
 */
export const registerUser = async (userInfo: RegisterUser | UserCreateData): Promise<User | null> => {
    try {
        return await createUser(new User({
            name: userInfo.name,
            lastName: userInfo.lastName,
            password: userInfo.password,
            isAdmin: false,
            email: userInfo.email,
            emailVerified: null,
            identification: userInfo.identification,
            identificationType: userInfo.identificationType,
            phoneNumber: userInfo.phoneNumber,
        }));
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @param id 
 * @param userInfo 
 * @returns 
 */
export const editUserById = async (id: string, userInfo: Partial<User>): Promise<User> => {
    try {
        return await updateUserById(id, userInfo);
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}