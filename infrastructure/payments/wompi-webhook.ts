import { PAYMENT_STATUSES, type ApplyPaymentEventCommand } from '@/application/payments/payment-events.commands';
import { sha256 } from '@/shared/crypto/sha256';
import { z } from 'zod';

const status = z.enum(PAYMENT_STATUSES);
const signaturePath = z.enum([
    'transaction.id',
    'transaction.status',
    'transaction.amount_in_cents',
    'transaction.reference',
    'transaction.currency',
    'transaction.created_at',
    'transaction.payment_method_type',
]);
const transaction = z.object({
    id: z.string().min(1), reference: z.string().min(1), status,
    payment_method_type: z.string().min(1), created_at: z.coerce.date(),
    amount_in_cents: z.number().finite().optional(),
    currency: z.string().min(1).optional(),
}).passthrough();
const webhook = z.object({
    data: z.object({ transaction }).passthrough(),
    signature: z.object({ properties: z.array(signaturePath).min(1) }),
    timestamp: z.union([z.string().min(1), z.number().finite()]),
}).passthrough();

type WompiWebhook = z.infer<typeof webhook>;
type WompiSignaturePath = z.infer<typeof signaturePath>;

const signatureField = (event: WompiWebhook, path: WompiSignaturePath): string | number | Date | undefined => {
    const transaction = event.data.transaction;
    switch (path) {
        case 'transaction.id': return transaction.id;
        case 'transaction.status': return transaction.status;
        case 'transaction.amount_in_cents': return transaction.amount_in_cents;
        case 'transaction.reference': return transaction.reference;
        case 'transaction.currency': return transaction.currency;
        case 'transaction.created_at': return transaction.created_at;
        case 'transaction.payment_method_type': return transaction.payment_method_type;
    }
};

export const parseWompiWebhook = (value: unknown): WompiWebhook => webhook.parse(value);

export const verifyWompiWebhook = async (
    event: WompiWebhook,
    checksum: string | null,
    eventKey: string,
): Promise<boolean> => {
    if (!checksum || eventKey.length === 0) return false;
    const fields = event.signature.properties.map((path) => signatureField(event, path));
    if (fields.some((field) => field === undefined)) return false;
    const expected = await sha256(`${fields.join('')}${event.timestamp}${eventKey}`);
    return expected === checksum;
};

export const toApplyPaymentEventCommand = (event: WompiWebhook): ApplyPaymentEventCommand => ({
    transactionId: event.data.transaction.id,
    reference: event.data.transaction.reference,
    status: event.data.transaction.status,
    paymentMethod: event.data.transaction.payment_method_type,
    occurredAt: event.data.transaction.created_at,
});
