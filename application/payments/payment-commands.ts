/** Commands accepted by payment use cases after the HTTP boundary validates them. */
export type QuoteCoursePaymentCommand = Readonly<{
    canonicalId: string;
}>;

export type RegisterCoursePaymentTransactionCommand = Readonly<{
    purchaseId: number;
    transactionId: string;
}>;
