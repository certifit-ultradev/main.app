import { logPrismaError } from "@/exceptions/error-encoder";
import { saveVideoLocalStorage, saveVideoVercelBlobStorage } from "@/repository/video"

export const storeVideoLocalStorage = async (file: File): Promise<string> => {
    try {
        return await saveVideoLocalStorage(file);
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

export const storeVideoBlobStorage = async (path: string, file: File): Promise<string> => {
    try {
        return await saveVideoVercelBlobStorage(path, file);
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}