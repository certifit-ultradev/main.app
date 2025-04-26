import { UserCourse } from "./user-course"

export class User {
    id: string;
    name: string;
    lastName: string;
    password?: string | null;
    email: string;
    isAdmin: boolean;
    emailVerified?: boolean | null;
    phoneNumber: string;
    createdAt: Date;
    updatedAt: Date | null;
    userCourse?: UserCourse[] | null;
    constructor(init?: Partial<User>) {
        Object.assign(this, init);
    }
}
