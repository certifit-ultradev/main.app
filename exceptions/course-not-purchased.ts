/**
 * CourseNotPurchasedError
 */
export class CourseNotPurchasedError extends Error {
    cause: string;
    message: string = 'Curso no comprado';
    constructor(cause: string) {
        super(`Curso no comprado: ${cause}`);
        this.name = 'CourseNotPurchasedError';
        this.cause = cause
    }
}