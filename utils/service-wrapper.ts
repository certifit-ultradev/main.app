/** Executes an application operation without translating or logging infrastructure errors. */
export async function executeService<T>(
    operation: () => Promise<T>,
): Promise<T> {
    return operation();
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
