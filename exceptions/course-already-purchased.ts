export class CourseAlreadyPurchasedError {
    cause: string;
    constructor(cause: string) {
        this.cause = cause
    }
}