/**
 * UserNotLoggedError class
 */
export class UserNotLoggedError {
    cause: string;
    constructor(cause: string) {
        this.cause = cause
    }
}