/**
 * UserExistError class
 */
export class UserExistError extends Error {
    cause: string;
    message: string = 'Usuario ya existe';
    constructor(cause: string) {
        super(`Usuario ya existe: ${cause}`);
        this.name = 'UserExistError';
        this.cause = cause
    }
}