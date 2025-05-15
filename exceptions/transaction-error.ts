/**
 * TransactionError class
 */
export class TransactionError {
    cause: string;
    constructor(cause: string) {
        this.cause = cause
    }
}