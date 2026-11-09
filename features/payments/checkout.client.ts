import { z } from 'zod';
import { ApiFailureSchema, apiSuccessSchema } from '@/interfaces/http/api-response.schema';
import {
    PaymentQuoteRequestSchema,
    PaymentQuoteResponseSchema,
    PaymentTransactionRequestSchema,
    PaymentTransactionResponseSchema,
    type PaymentQuoteResponse,
    type PaymentTransactionResponse,
} from '@/interfaces/http/payments/payment.contract';

type Fetcher = typeof fetch;

const WidgetCheckoutResultSchema = z.object({ transaction: z.object({ id: z.string().min(1) }) });

export type CheckoutQuote = PaymentQuoteResponse;
export type CheckoutTransactionResult = PaymentTransactionResponse;

export class CheckoutHttpError extends Error {
    constructor(message: string, readonly status: number) {
        super(message);
        this.name = 'CheckoutHttpError';
    }
}

async function requestCheckout<T extends z.ZodTypeAny>(path: string, body: unknown, schema: T, fetcher: Fetcher): Promise<z.infer<T>> {
    let response: Response;
    try {
        response = await fetcher(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } catch {
        throw new CheckoutHttpError('No fue posible conectar con el servicio de pagos.', 0);
    }
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
        const failure = ApiFailureSchema.safeParse(payload);
        throw new CheckoutHttpError(failure.success ? failure.data.error.message : 'No fue posible procesar el pago.', response.status);
    }
    const parsed = apiSuccessSchema(schema).safeParse(payload);
    if (!parsed.success) throw new CheckoutHttpError('La respuesta de pago no tiene el formato esperado.', 502);
    return parsed.data.data;
}

export const quoteCourseCheckout = async (canonicalId: string, fetcher: Fetcher = fetch): Promise<CheckoutQuote> =>
    requestCheckout('/api/payment/transactions/quote', PaymentQuoteRequestSchema.parse({ canonicalId }), PaymentQuoteResponseSchema, fetcher);

export const registerCourseCheckout = async (purchaseId: number, transactionId: string, fetcher: Fetcher = fetch): Promise<CheckoutTransactionResult> =>
    requestCheckout('/api/payment/transactions', PaymentTransactionRequestSchema.parse({ purchaseId, transactionId }), PaymentTransactionResponseSchema, fetcher);

export function parseCheckoutWidgetTransactionId(result: unknown): string {
    const parsed = WidgetCheckoutResultSchema.safeParse(result);
    if (!parsed.success) throw new Error('El proveedor no devolvió una transacción válida.');
    return parsed.data.transaction.id;
}
