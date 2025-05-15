/**
 * CourseAlreadyPurchasedError
 * This error is thrown when a user tries to purchase a course that they have already purchased.
 */
export class CourseAlreadyPurchasedError {
    cause: string;
    constructor(cause: string) {
        this.cause = cause
    }
}