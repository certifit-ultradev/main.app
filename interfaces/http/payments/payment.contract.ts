import { z } from 'zod';
import { PAYMENT_STATUSES } from '@/application/payments/payment-events.commands';

const canonicalId = z.string().trim().min(1, 'El identificador del curso es obligatorio.').max(120);
const purchaseId = z.number().int().positive('La compra no es válida.');
const transactionId = z.string().trim().min(1, 'La transacción es obligatoria.').max(255);

export const PaymentQuoteRequestSchema = z.object({ canonicalId }).strict();
export const PaymentTransactionRequestSchema = z.object({ purchaseId, transactionId }).strict();
export const PaymentStatusSchema = z.enum(PAYMENT_STATUSES);

export const PaymentQuoteResponseSchema = z.object({
    purchaseId: z.number().int().positive(),
    currency: z.literal('COP'),
    amountInCents: z.number().finite().positive(),
    reference: z.string().min(1),
    publicKey: z.string().min(1),
    signature: z.object({ integrity: z.string().min(1) }).strict(),
    redirectUrl: z.string().url(),
    expirationTime: z.number().finite(),
}).strict();

export const PaymentTransactionResponseSchema = z.object({
    message: z.string().min(1),
}).strict();

export type PaymentQuoteRequest = z.infer<typeof PaymentQuoteRequestSchema>;
export type PaymentTransactionRequest = z.infer<typeof PaymentTransactionRequestSchema>;
export type PaymentQuoteResponse = z.infer<typeof PaymentQuoteResponseSchema>;
export type PaymentTransactionResponse = z.infer<typeof PaymentTransactionResponseSchema>;
