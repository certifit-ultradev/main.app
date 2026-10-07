import { PaymentProviderError } from '@/exceptions/payment-provider-error';
import { TransactionWompiResponseSchema } from '@/infrastructure/payments/wompi.types';
import { getWompiBaseUrl } from "@/config/env";
import type { PaymentTransactionRecord } from '@/application/payments/payment.records';

/**
 * Obtains the information of a Wompi transaction
 * @param {string} trxId - ID of the transaction you want to query
 * @returns Validated payment transaction data or an error if it fails
 */
export const getTransaction = async (trxId: string): Promise<PaymentTransactionRecord> => {
    const baseUrl = getWompiBaseUrl();

    let response: Response;
    try {
        response = await fetch(`${baseUrl}/transactions/${trxId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
    } catch {
        throw new PaymentProviderError('unavailable');
    }

    if (!response.ok) {
        throw new PaymentProviderError(response.status === 404 ? 'transaction_not_found' : 'upstream_error');
    }

    let originalData: unknown;
    try {
        originalData = await response.json();
    } catch {
        throw new PaymentProviderError('invalid_response');
    }
    const parsed = TransactionWompiResponseSchema.safeParse(originalData);
    if (!parsed.success) throw new PaymentProviderError('invalid_response');

    const { data } = parsed.data;
    return {
        id: data.id,
        reference: data.reference,
        status: data.status,
        paymentMethodType: data.payment_method_type,
        createdAt: data.created_at,
    };
}
