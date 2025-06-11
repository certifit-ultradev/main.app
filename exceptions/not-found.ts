/**
 * NotFoundError class
 */
export class NotFoundError extends Error {
    cause: string;
    message: string = 'Recurso no encontrado';
    constructor(cause: string) {
        super(`Recurso no encontrado: ${cause}`);
        this.name = 'NotFoundError';
        this.cause = cause
    }
}