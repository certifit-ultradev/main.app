import { logPrismaError } from "@/exceptions/error-encoder";

/**
 * Opciones para el wrapper de servicio
 */
export interface ServiceWrapperOptions {
    /** Si es true, relanza el error después de loguearlo (default: true) */
    rethrow?: boolean;
    /** Nombre de la operación para logging */
    operationName?: string;
}

/**
 * Wrapper para operaciones de servicio con manejo de errores consistente
 * Centraliza el patrón try-catch con logPrismaError
 * 
 * @example
 * // Forma básica
 * export const getCourseById = async (id: number) => {
 *     return executeService(() => findCourseById(id));
 * };
 * 
 * // Con nombre de operación para logging
 * export const getCourseById = async (id: number) => {
 *     return executeService(
 *         () => findCourseById(id),
 *         { operationName: 'getCourseById' }
 *     );
 * };
 */
export async function executeService<T>(
    operation: () => Promise<T>,
    options: ServiceWrapperOptions = {}
): Promise<T> {
    const { rethrow = true, operationName } = options;

    try {
        return await operation();
    } catch (error) {
        if (operationName) {
            console.error(`[Service Error] ${operationName}:`, error);
        }
        logPrismaError(error);

        if (rethrow) {
            throw error;
        }

        throw error; // TypeScript: garantiza que siempre lanzamos
    }
}

/**
 * Wrapper que retorna un valor por defecto en caso de error
 * Útil para operaciones donde un fallo no debería detener el flujo
 * 
 * @example
 * export const getAllUsers = async (page: number) => {
 *     return executeServiceWithDefault(
 *         () => findAllUsers(page),
 *         { data: [], page: 1, lastPage: 1, total: 0 }
 *     );
 * };
 */
export async function executeServiceWithDefault<T>(
    operation: () => Promise<T>,
    defaultValue: T,
    options: Omit<ServiceWrapperOptions, 'rethrow'> = {}
): Promise<T> {
    const { operationName } = options;

    try {
        return await operation();
    } catch (error) {
        if (operationName) {
            console.error(`[Service Warning] ${operationName} failed, returning default:`, error);
        }
        logPrismaError(error);
        return defaultValue;
    }
}

/**
 * Tipo para resultado de operación que puede fallar
 */
export type ServiceResult<T, E = Error> =
    | { success: true; data: T }
    | { success: false; error: E };

/**
 * Wrapper que retorna un Result type en lugar de lanzar excepciones
 * Útil para operaciones donde queremos manejar errores de forma explícita
 * 
 * @example
 * const result = await executeServiceSafe(() => createUser(data));
 * if (result.success) {
 *     console.log('User created:', result.data);
 * } else {
 *     console.error('Failed:', result.error);
 * }
 */
export async function executeServiceSafe<T>(
    operation: () => Promise<T>,
    options: Omit<ServiceWrapperOptions, 'rethrow'> = {}
): Promise<ServiceResult<T>> {
    const { operationName } = options;

    try {
        const data = await operation();
        return { success: true, data };
    } catch (error) {
        if (operationName) {
            console.error(`[Service Error] ${operationName}:`, error);
        }
        logPrismaError(error);
        return { success: false, error: error as Error };
    }
}
