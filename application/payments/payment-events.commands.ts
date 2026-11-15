export const PAYMENT_STATUSES = ['PENDING', 'APPROVED', 'DECLINED', 'VOIDED', 'ERROR'] as const;
export type PaymentStatus = typeof PAYMENT_STATUSES[number];

export const isPaymentStatus = (value: string): value is PaymentStatus => (
    PAYMENT_STATUSES.some((status) => status === value)
);

/** Provider-independent payment event accepted by the payments use case. */
export type ApplyPaymentEventCommand = Readonly<{
    transactionId: string;
    reference: string;
    status: PaymentStatus;
    paymentMethod: string;
    occurredAt: Date;
}>;
