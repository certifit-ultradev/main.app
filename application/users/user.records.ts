/** Internal persistence record. It is never returned directly by an action or HTTP route. */
export type PersistedUserRecord = {
    id: string;
    name: string;
    lastName: string;
    email: string;
    passwordHash: string | null;
    isAdmin: boolean;
    emailVerified: Date | null;
    identification: string | null;
    identificationType: string | null;
    phoneNumber: string;
    profileImage: string | null;
    createdAt: Date;
    updatedAt: Date | null;
};

/** Narrow record used for a student's own profile. Credentials never leave persistence. */
export type ClientProfileRecord = {
    id: string;
    name: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    profileImage: string | null;
    identification: string | null;
    identificationType: string | null;
    createdAt: Date;
    isAdmin: boolean;
};

export type UserCourseEnrollmentRecord = {
    id: number;
    userId: string;
    courseId: number;
    createdAt: Date;
};

/**
 * User repository convention: singular reads return `null` for normal
 * absence, plural reads return `[]`, and idempotent enrollment removal
 * returns whether a row was actually removed. Write failures reject.
 */
