import { prisma } from "@/lib/prisma";
import type { CreatePersistedUserCommand, UpdatePersistedUserCommand } from '@/application/users/user.commands';
import type { ClientProfileRecord, PersistedUserRecord, UserCourseEnrollmentRecord } from '@/application/users/user.records';
import { UserExistError } from '@/exceptions/user-exist';
import { safeLogger } from '@/shared/observability/safe-logger';
import { getSafePrismaErrorCode } from '@/shared/observability/prisma-error-code';

const toUserRecord = (user: {
    id: string; name: string; lastName: string; email: string; password: string | null; isAdmin: boolean;
    emailVerified: Date | null; identification: string | null; identificationType: string | null;
    phoneNumber: string; profileImage: string | null; createdAt: Date; updatedAt: Date | null;
}): PersistedUserRecord => ({
    id: user.id, name: user.name, lastName: user.lastName, email: user.email, passwordHash: user.password,
    isAdmin: user.isAdmin, emailVerified: user.emailVerified, identification: user.identification,
    identificationType: user.identificationType, phoneNumber: user.phoneNumber, profileImage: user.profileImage,
    createdAt: user.createdAt, updatedAt: user.updatedAt,
});

const clientProfileSelect = {
    id: true, name: true, lastName: true, email: true, phoneNumber: true,
    profileImage: true, identification: true, identificationType: true,
    createdAt: true, isAdmin: true,
} as const;

export const findClientProfileById = async (id: string): Promise<ClientProfileRecord | null> =>
    prisma.user.findUnique({ where: { id }, select: clientProfileSelect });

export const updateClientProfileById = async (
    id: string,
    patch: { name?: string; lastName?: string; phoneNumber?: string; profileImage?: string | null },
): Promise<ClientProfileRecord> => prisma.user.update({
    where: { id },
    data: {
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.lastName !== undefined ? { lastName: patch.lastName } : {}),
        ...(patch.phoneNumber !== undefined ? { phoneNumber: patch.phoneNumber } : {}),
        ...(patch.profileImage !== undefined ? { profileImage: patch.profileImage } : {}),
    },
    select: clientProfileSelect,
});

export const isProfileImageReferenced = async (url: string): Promise<boolean> =>
    (await prisma.user.count({ where: { profileImage: url } })) > 0;

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
export const allUsers = async (page: number, pageSize: number): Promise<PersistedUserRecord[]> => {
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

    return users.map(toUserRecord);
}

/**
 * 
 * @param phoneNumber 
 * @returns 
 */
export const findUserByPhoneNumber = async (phoneNumber: string): Promise<PersistedUserRecord | null> => {
    const user = await prisma.user.findFirst({ where: { phoneNumber } });
    return user ? toUserRecord(user) : null;
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
export const findUserByEmail = async (email: string): Promise<PersistedUserRecord | null> => {
    const user = await prisma.user.findFirst({ where: { email } });
    return user ? toUserRecord(user) : null;
};

/**
 * 
 * @param id 
 * @returns 
 */
export const findUserById = async (id: string): Promise<PersistedUserRecord | null> => {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? toUserRecord(user) : null;
};

/**
 * 
 * @param id 
 * @param data 
 * @returns 
 */
export const updateUserById = async (id: string, data: UpdatePersistedUserCommand): Promise<PersistedUserRecord> => {
    const updateData = {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.lastName !== undefined ? { lastName: data.lastName } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.phoneNumber !== undefined ? { phoneNumber: data.phoneNumber } : {}),
        ...(data.identification !== undefined ? { identification: data.identification } : {}),
        ...(data.identificationType !== undefined ? { identificationType: data.identificationType } : {}),
        ...(data.emailVerified !== undefined ? { emailVerified: data.emailVerified } : {}),
        ...(data.passwordHash !== undefined ? { password: data.passwordHash } : {}),
    };
    const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
    });
    return toUserRecord(updatedUser);
}

/**
 * 
 * @param id 
 * @returns 
 */
export const createUser = async (user: CreatePersistedUserCommand): Promise<PersistedUserRecord> => {
    try {
        const createdUser = await prisma.user.create({
            data: {
                name: user.name,
                lastName: user.lastName,
                password: user.passwordHash,
                email: user.email,
                isAdmin: user.isAdmin,
                emailVerified: user.emailVerified,
                identification: user.identification,
                identificationType: user.identificationType,
                phoneNumber: user.phoneNumber,
            }
        });
        return toUserRecord(createdUser);
    } catch (error) {
        if (getSafePrismaErrorCode(error) === 'P2002') {
            throw new UserExistError('registro duplicado');
        }
        safeLogger.error('repository.user.create.failed', {}, error);
        throw error;
    }
}

/**
 * 
 * @param id 
 * @returns 
 */
export const assignCourse = async (userId: string, courseId: number): Promise<UserCourseEnrollmentRecord> => {
    const createdUserAssignation = await prisma.userCourse.create({
        data: {
            userId,
            courseId
        }
    });
    return createdUserAssignation;
}

/**
 * Idempotent enrollment reversal. `false` means there was no enrollment to
 * remove; database failures still reject instead of being hidden as absence.
 */
export const removeCourseFromUser = async (userId: string, courseId: number): Promise<boolean> => {
    const result = await prisma.userCourse.deleteMany({ where: { userId, courseId } });
    return result.count > 0;
};
