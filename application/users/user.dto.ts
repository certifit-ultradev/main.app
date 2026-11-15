import type { UserIdentificationType } from './user.commands';

/** Serializable administrative projection. It must never contain a password or hash. */
export type AdminUserDto = {
    id: string;
    name: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    profileImage: string | null;
    isAdmin: boolean;
    emailVerified: string | null;
    identification: string | null;
    identificationType: UserIdentificationType | null;
    createdAt: string | null;
    updatedAt: string | null;
};

/** Public projection of the authenticated client's own account. */
export type ClientProfileDto = {
    id: string;
    name: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    profileImage: string | null;
    identification: string | null;
    identificationType: string | null;
    createdAt: string;
};

export type AdminUserPageDto = {
    data: AdminUserDto[];
    page: number;
    lastPage: number;
    total: number;
};
