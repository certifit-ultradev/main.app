import { logPrismaError } from "@/exceptions/error-encoder";
import { getTransaction } from "@/repository/wompi-api";

/**
 * 
 * @param trxId 
 * @returns 
 */
export const fetchTransaction = async (trxId: string) => {
    try {
        return await getTransaction(trxId);
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}