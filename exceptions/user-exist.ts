/**
 * UserExistError class
 */
export class UserExistError {
    cause: string;
    constructor(cause: string) {
        this.cause = cause
    }
}