/** Stable gateway failure without transaction IDs, provider payloads or transport details. */
export type PaymentProviderFailureKind =
    | 'transaction_not_found'
    | 'upstream_error'
    | 'unavailable'
    | 'invalid_response';

export class PaymentProviderError extends Error {
    constructor(readonly kind: PaymentProviderFailureKind) {
        super('No fue posible consultar la transacción con el proveedor de pagos.');
        this.name = 'PaymentProviderError';
    }
}
