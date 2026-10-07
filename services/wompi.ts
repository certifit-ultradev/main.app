import { getTransaction } from "@/repository/wompi-api";
import { executeService } from "@/utils/service-wrapper";
import type { PaymentTransactionRecord } from '@/application/payments/payment.records';

/** Fetches the validated gateway projection for payment registration. */
export const fetchTransaction = async (trxId: string): Promise<PaymentTransactionRecord> => {
    return executeService(() => getTransaction(trxId));
}
