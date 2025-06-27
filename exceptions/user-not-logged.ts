/**
 * UserNotLoggedError class
 */
export class UserNotLoggedError extends Error {
    cause: string;
    message: string = 'Usuario no ha iniciado sesión';
    constructor(cause: string) {
        super(`Usuario no ha iniciado sesión: ${cause}`);
        this.name = 'UserNotLoggedError';
        this.cause = cause
    }
}