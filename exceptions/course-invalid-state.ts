/**
 * CourseInvalidStateError
 */
export class CourseInvalidStateError extends Error {
    cause: string;
    message: string = 'Curso en estado invalido';
    constructor(cause: string) {
        super(`Curso en estado invalido: ${cause}`);
        this.name = 'CourseInvalidStateError';
        this.cause = cause
    }
}