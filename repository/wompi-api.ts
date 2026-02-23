import { TransactionError } from "@/exceptions/transaction-error";
import { Transaction } from "@/models/transaction";
import { TransactionWompiResponse } from "@/utils/types";
import { getWompiBaseUrl } from "@/config/env";

/**
 * Obtains the information of a Wompi transaction
 * @param {string} trxId - ID of the transaction you want to query
 * @returns {Promise<Transaction>} Transaction data or an error if it fails
 */
export const getTransaction = async (trxId: string): Promise<Transaction> => {
    const baseUrl = getWompiBaseUrl();
    
    const response = await fetch(`${baseUrl}/transactions/${trxId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new TransactionError(`Error Wompi: Status ${response.status}`);
    }

    const originalData = await response.json();

    return Transaction.fromWompiResponse(originalData as TransactionWompiResponse);
}