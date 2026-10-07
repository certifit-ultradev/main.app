import { allUsers, countAllUsers, createUser, findUserByEmail, findUserById, findUserByPhoneNumber, updateUserById } from "@/repository/users"
import { executeService } from "@/utils/service-wrapper";
import { bcryptPasswordHasher } from '@/infrastructure/identity/bcrypt-password-hasher';
import type { AdminUserDto, AdminUserPageDto } from '@/application/users/user.dto';
import type { CreateUserCommand, UpdateUserCommand } from '@/application/users/user.commands';
import type { PersistedUserRecord } from '@/application/users/user.records';

export const USERS_PAGE_SIZE = 10;

/**
 * 
 * @param page 
 * @returns 
 */
const toAdminUserDto = (user: PersistedUserRecord): AdminUserDto => {
    if (!user.id) throw new Error('El usuario persistido no tiene identificador.');
    const identificationType = user.identificationType;
    if (identificationType !== null && identificationType !== 'CC' && identificationType !== 'TI'
        && identificationType !== 'CE' && identificationType !== 'NIT' && identificationType !== 'PAS') {
        throw new Error('El usuario persistido tiene un tipo de identificación inválido.');
    }

    return {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isAdmin: user.isAdmin,
        emailVerified: user.emailVerified?.toISOString() ?? null,
        identification: user.identification ?? null,
        identificationType,
        createdAt: user.createdAt?.toISOString() ?? null,
        updatedAt: user.updatedAt?.toISOString() ?? null,
    };
};

/** Administrative read boundary: returns a serializable projection without credentials. */
export const listAdminUsers = async (request: { page: number }): Promise<AdminUserPageDto> => {
    return executeService(
        async () => {
            const pagedUsers = await allUsers(request.page, USERS_PAGE_SIZE);
            const totalUsers = await countAllUsers();
            const totalPages = Math.ceil(totalUsers / USERS_PAGE_SIZE);

            return {
                data: pagedUsers.map(toAdminUserDto),
                page: request.page,
                lastPage: totalPages,
                total: totalPages
            };
        }
    );
}

/**
 * 
 * @param id 
 * @returns 
 */
export const getUserByEmail = async (email: string): Promise<PersistedUserRecord | null> => {
    return executeService(() => findUserByEmail(email));
}

/**
 * 
 * @param phoneNumber 
 * @returns 
 */
export const getUserByPhoneNumber = async (phoneNumber: string): Promise<PersistedUserRecord | null> => {
    return executeService(() => findUserByPhoneNumber(phoneNumber));
}

/**
 * 
 * @param id 
 * @returns 
 */
/** Administrative read boundary: returns a serializable projection without credentials. */
export const getAdminUserById = async (id: string): Promise<AdminUserDto | null> => {
    return executeService(async () => {
        const user = await findUserById(id);
        if (!user) return null;
        return toAdminUserDto(user);
    });
}

/** Administrative existence check that does not expose the persistence model. */
export const userExistsByEmail = async (email: string): Promise<boolean> => {
    return executeService(async () => {
        return (await findUserByEmail(email)) !== null;
    });
}

/**
 * 
 * @param userInfo 
 * @returns 
 */
export const registerUser = async (userInfo: CreateUserCommand): Promise<PersistedUserRecord> => {
    return executeService(async () => createUser({
        name: userInfo.name,
        lastName: userInfo.lastName,
        passwordHash: await bcryptPasswordHasher.hash(userInfo.password),
        isAdmin: false,
        email: userInfo.email,
        emailVerified: null,
        identification: userInfo.identification,
        identificationType: userInfo.identificationType,
        phoneNumber: userInfo.phoneNumber,
    }));
}

/**
 * 
 * @param id 
 * @param userInfo 
 * @returns 
 */
export const editUserById = async (id: string, userInfo: UpdateUserCommand): Promise<PersistedUserRecord> => {
    return executeService(async () => {
        const { password, ...profile } = userInfo;
        return updateUserById(id, {
            ...profile,
            ...(password ? { passwordHash: await bcryptPasswordHasher.hash(password) } : {}),
        });
    });
}
