import { ServerActionRequest, ServerActionResponse } from "@/utils/types";

/**
 * Cada Middleware recibe un ServerActionRequest y puede:
 * - Retornar `undefined` si la validación pasa.
 * - Retornar un `ServerActionResponse` con `success: false` para abortar la cadena.
 */
export type Middleware<T> = (
    req: ServerActionRequest<T>
) => Promise<ServerActionResponse<any> | undefined>;

/**
 * Middlewares ejecuta en orden varios middlewares. Si alguno falla, se retorna ese error;
 * si todos pasan, se ejecuta `finalAction`.
 * 
 * @param req Objeto con `data` de la petición
 * @param middlewares Array de middlewares a ejecutar secuencialmente
 * @param finalAction Acción final que se llama si todos los middlewares pasan
 * @returns ServerActionResponse<TFinal>
 */
export async function Middlewares<TFinal, TData>(
    req: ServerActionRequest<TData>,
    middlewares: Middleware<TData>[],
    finalAction: (data: TData) => Promise<ServerActionResponse<TFinal>>
): Promise<ServerActionResponse<TFinal>> {
    for (const mw of middlewares) {
        const result = await mw(req);
        // Si el middleware retorna un error (success: false)
        if (result && result.success === false) {
            return result;
        }
    }
    // Si llegamos aquí, todos los middlewares pasaron
    return finalAction(req.data);
}