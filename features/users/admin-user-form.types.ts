import type { UserIdentificationType } from '@/application/users/user.commands';

/** Initial browser state for the administrative user form; credentials are input-only. */
export type AdminUserFormValues = {
    id?: string;
    name: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    identification: string | null;
    identificationType: UserIdentificationType | null;
};
