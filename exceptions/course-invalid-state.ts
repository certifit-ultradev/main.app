export class CourseInvalidStateError {
    cause: string;
    constructor(cause: string) {
        this.cause = cause
    }
}