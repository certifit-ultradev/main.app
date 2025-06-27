/**
 * TransactionError class
 */
export class TransactionError extends Error {
    cause: string;
    message: string;
    constructor(cause: string) {
        super(`Error en la transacción: ${cause}`);
        this.cause = cause;
        this.name = 'TransactionError';
        this.message = `Error en la transacción: ${cause}`;
    }
}