import { TransactionError } from "@/exceptions/transaction-error";
import { Transaction } from "@/models/transaction";
import { TransactionWompiResponse } from "@/utils/types";

const urlSanbox = 'https://sandbox.wompi.co/v1';
const urlProd = 'https://production.wompi.co/v1';

const isSandbox = true;
const baseUrl = isSandbox ? urlSanbox : urlProd;

/**
 * Obtiene la información de una transacción de Wompi
 * @param {string} trxId - ID de la transacción que quieres consultar
 * @returns {Promise<any>} Datos de la transacción (objeto JSON) o un error si falla
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