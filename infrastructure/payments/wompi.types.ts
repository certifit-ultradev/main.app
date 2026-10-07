import { z } from 'zod';
import { PAYMENT_STATUSES } from '@/application/payments/payment-events.commands';

/** Provider payload validated and normalized before mapping to a transaction. */
export const TransactionWompiResponseSchema = z.object({
    data: z.object({
        id: z.string().min(1),
        created_at: z.union([z.string().datetime(), z.date()]).transform((value) => new Date(value)),
        amount_in_cents: z.number().int().nonnegative(),
        status: z.enum(PAYMENT_STATUSES),
        reference: z.string().min(1),
        customer_email: z.string().email(),
        currency: z.string().min(1),
        payment_method_type: z.string().min(1),
        payment_method: z.object({ phone_number: z.string() }),
        redirect_url: z.string(),
        payment_link_id: z.string(),
    }),
});

export type TransactionWompiResponse = z.infer<typeof TransactionWompiResponseSchema>;
