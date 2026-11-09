export type UserIdentificationType = 'CC' | 'TI' | 'CE' | 'NIT' | 'PAS';

/** Plain-text command accepted only at the application boundary. */
export type CreateUserCommand = {
    name: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    identification?: string | null;
    identificationType?: UserIdentificationType | null;
};

/**
 * Plain-text patch accepted only at the application boundary.
 * `undefined` omits a field; `null` clears nullable identity fields and
 * `emailVerified`; empty required strings are rejected by action schemas.
 * Empty identification input is normalized to `null` by the admin action.
 */
export type UpdateUserCommand = {
    name?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
    identification?: string | null;
    identificationType?: UserIdentificationType | null;
    emailVerified?: Date | null;
};

/** Closed persistence command. Passwords reaching a repository are always hashes. */
export type CreatePersistedUserCommand = Omit<CreateUserCommand, 'password'> & {
    passwordHash: string;
    isAdmin: boolean;
    emailVerified: Date | null;
};

/** Closed persistence patch: undefined omits, null clears; passwords are hashes. */
export type UpdatePersistedUserCommand = Omit<UpdateUserCommand, 'password'> & {
    passwordHash?: string;
};
