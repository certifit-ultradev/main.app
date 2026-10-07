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
    createdAt: Date;
    updatedAt: Date | null;
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
