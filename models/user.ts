import { UserCourse } from "./user-course"

export class User {
    id?: string;
    name: string;
    lastName: string;
    password?: string | null;
    email: string;
    isAdmin: boolean;
    emailVerified?: Date | null;
    phoneNumber: string;
    createdAt?: Date;
    updatedAt?: Date | null;
    userCourse?: UserCourse[];

    constructor(
        data: {
            id?: string;
            name: string;
            lastName: string;
            password?: string | null;
            email: string;
            isAdmin: boolean;
            emailVerified?: Date | null;
            phoneNumber: string;
            createdAt?: Date;
            updatedAt?: Date | null;
            userCourse?: UserCourse[];
        }
    ) {
        this.id = data.id || undefined;
        this.name = data.name;
        this.lastName = data.lastName;
        this.password = data.password || null;
        this.email = data.email;
        this.isAdmin = data.isAdmin || false;
        this.emailVerified = data.emailVerified || null;
        this.phoneNumber = data.phoneNumber || '';
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || null;
        this.userCourse = data.userCourse;
    }
}
