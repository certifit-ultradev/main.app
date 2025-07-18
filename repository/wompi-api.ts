import { TransactionError } from "@/exceptions/transaction-error";
import { Transaction } from "@/models/transaction";
import { TransactionWompiResponse } from "@/utils/types";

const urlSanbox = 'https://sandbox.wompi.co/v1';
const urlProd = 'https://production.wompi.co/v1';

const baseUrl = process.env.APP_ENV != 'PROD' ? urlSanbox : urlProd;

/**
 * Obtains the information of a Wompi transaction
 * @param {string} trxId - ID of the transaction you want to query
 * @returns {Promise<any>} Transaction data (JSON object) or an error if it fails
 */
export const getTransaction = async (trxId: string): Promise<Transaction> => {
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