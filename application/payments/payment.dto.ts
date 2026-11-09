/** Serializable data required to initialize the Wompi checkout widget. */
export type CoursePaymentQuoteDto = Readonly<{
    purchaseId: number;
    currency: 'COP';
    amountInCents: number;
    reference: string;
    publicKey: string;
    redirectUrl: string;
    signature: { integrity: string };
    expirationTime: number;
}>;

export type CoursePaymentTransactionDto = Readonly<{
    success: true;
    message: string;
}>;

/** Outcome of applying a signed payment event; HTTP acknowledgements belong to the provider adapter. */
export type ApplyPaymentEventResult =
    | Readonly<{ outcome: 'applied' }>
    | Readonly<{ outcome: 'already_applied' }>;
