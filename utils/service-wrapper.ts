import { safeLogger, type SafeLogMetadata } from '@/shared/observability/safe-logger';
import { isExpectedApplicationError } from '@/exceptions/is-expected-application-error';

/** Executes a service operation and attaches safe context when it fails. */
export async function executeService<T>(
    operation: () => Promise<T>,
    failure?: { event: string; metadata?: SafeLogMetadata },
): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        if (failure) {
            if (isExpectedApplicationError(error)) safeLogger.debug(failure.event, failure.metadata);
            else safeLogger.error(failure.event, failure.metadata, error);
        }
        throw error;
    }
}

/** Discriminated result for callers that deliberately handle an operation failure. */
export type ServiceResult<T, E = unknown> =
    | { success: true; data: T }
    | { success: false; error: E };

/**
 * Wrapper que retorna un Result type en lugar de lanzar excepciones
 * Útil para operaciones donde queremos manejar errores de forma explícita
 * 
 * @example
 * const result = await executeServiceSafe(() => createUser(data));
 * if (!result.success) return result;
 */
export async function executeServiceSafe<T>(
    operation: () => Promise<T>,
): Promise<ServiceResult<T>> {
    try {
        const data = await operation();
        return { success: true, data };
    } catch (error) {
        return { success: false, error };
    }
}
