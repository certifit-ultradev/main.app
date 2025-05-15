import { NotFoundError } from "@/exceptions/not-found";
import { prisma } from "@/lib/prisma";
import { User } from "@/models/user";
import { UserCourse } from "@/models/user-course";
import bcrypt from "bcryptjs";

/**
 * This repository is responsible for managing the users in the database.
 * It provides methods to create, update, delete and find users.
 */

/**
 * 
 * @param page
 * @param pageSize
 * @returns
 */
export const allUsers = async (page: number, pageSize: number): Promise<User[]> => {
    if (page < 1) {
        page = 1;
    }
    const users = await prisma.user.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize
    });

    if (users.length == 0) {
        return [];
    }

    return users.map<User>((user) => {
        return new User({ ...user })
    })
}

/**
 * 
 * @param phoneNumber 
 * @returns 
 */
export const findUserByPhoneNumber = async (phoneNumber: string): Promise<User> => {
    const user = await prisma.user.findFirst({ where: { phoneNumber } });
    if (!user) {
        throw new NotFoundError('Usuario no encontrado');
    }

    return new User({
        ...user
    });
};

/**
 * 
 * @returns 
 */
export const countAllUsers = async (): Promise<number> => {
    return await prisma.user.count();
}

/**
 * 
 * @param email 
 * @returns 
 */
export const findUserByEmail = async (email: string): Promise<User> => {
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
        throw new NotFoundError('Usuario no encontrado');
    }

    return new User(user);
};

/**
 * 
 * @param id 
 * @returns 
 */
export const findUserById = async (id: string): Promise<User> => {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
        throw new NotFoundError('Usuario no encontrado');
    }

    return new User(user);
};

/**
 * 
 * @param id 
 * @param data 
 * @returns 
 */
export const updateUserById = async (id: string, data: Partial<User>): Promise<User> => {
    if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
    }

    console.log('data', data);

    const { userCourse, ...updateData } = data;
    const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
    });
    return new User(updatedUser);
}

/**
 * 
 * @param id 
 * @returns 
 */
export const createUser = async (user: User): Promise<User | null> => {
    if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
    }

    const createdUser = await prisma.user.create({
        data: {
            name: user.name,
            lastName: user.lastName,
            password: user.password,
            email: user.email,
            isAdmin: user.isAdmin,
            emailVerified: user.emailVerified,
            phoneNumber: user.phoneNumber,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    });
    return createdUser;
}

/**
 * 
 * @param id 
 * @returns 
 */
export const assignCourse = async (userId: string, courseId: number): Promise<UserCourse | null> => {
    const createdUserAssignation = await prisma.userCourse.create({
        data: {
            userId,
            courseId
        }
    });
    return new UserCourse({
        ...createdUserAssignation
    });
}