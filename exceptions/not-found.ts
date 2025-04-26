export class NotFoundError {
    cause: string;
    constructor(cause: string) {
        this.cause = cause
    }
}