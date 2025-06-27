/**
 * CourseAlreadyPurchasedError
 * This error is thrown when a user tries to purchase a course that they have already purchased.
 */
export class CourseAlreadyPurchasedError extends Error {
    cause: string;
    message: string = 'Curso ya ha sido comprado';
    constructor(cause: string) {
        super(`Curso ya ha sido comprado: ${cause}`);
        this.name = 'CourseAlreadyPurchasedError';
        this.cause = cause
    }
}