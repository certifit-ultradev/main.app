import { PaymentProviderError } from '@/exceptions/payment-provider-error';
import { TransactionWompiResponseSchema } from '@/infrastructure/payments/wompi.types';
import { getWompiBaseUrl } from "@/config/env";
import type { PaymentTransactionRecord } from '@/application/payments/payment.records';
import { safeLogger } from '@/shared/observability/safe-logger';

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
    } catch (error) {
        safeLogger.warn('repository.payment_provider.transaction.request.failed', {}, error);
        throw new PaymentProviderError('unavailable');
    }

    if (!response.ok) {
        if (response.status !== 404) {
            safeLogger.warn('repository.payment_provider.transaction.http_failed', { status: response.status });
        }
        throw new PaymentProviderError(response.status === 404 ? 'transaction_not_found' : 'upstream_error');
    }

    let originalData: unknown;
    try {
        originalData = await response.json();
    } catch (error) {
        safeLogger.error('repository.payment_provider.transaction.response_invalid', { status: response.status }, error);
        throw new PaymentProviderError('invalid_response');
    }
    const parsed = TransactionWompiResponseSchema.safeParse(originalData);
    if (!parsed.success) {
        safeLogger.error('repository.payment_provider.transaction.schema_invalid', { status: response.status });
        throw new PaymentProviderError('invalid_response');
    }

    const { data } = parsed.data;
    return {
        id: data.id,
        reference: data.reference,
        status: data.status,
        paymentMethodType: data.payment_method_type,
        createdAt: data.created_at,
    };
}
