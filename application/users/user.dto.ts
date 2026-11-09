import type { UserIdentificationType } from './user.commands';

/** Serializable administrative projection. It must never contain a password or hash. */
export type AdminUserDto = {
    id: string;
    name: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    isAdmin: boolean;
    emailVerified: string | null;
    identification: string | null;
    identificationType: UserIdentificationType | null;
    createdAt: string | null;
    updatedAt: string | null;
};

export type AdminUserPageDto = {
    data: AdminUserDto[];
    page: number;
    lastPage: number;
    total: number;
};
