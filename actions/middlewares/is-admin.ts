import { ServerActionRequest, ServerActionResponse } from "@/utils/types";
import { Middleware } from "../server-action-middleware";
import { auth } from "@/auth";

// Ejemplo de datos que podrían indicar si un usuario es admin:
interface UserData {
    isAdmin?: boolean;
    [key: string]: any; // Otras propiedades
}

/**
 * isAdminMiddleware revisa si `request.data.isAdmin` es true.
 * Si no lo es, retorna un error abortando la acción.
 */
export const isAdmin: Middleware<any> = async (
    req: ServerActionRequest<any>
): Promise<ServerActionResponse<any> | undefined> => {
    const session = await auth();
    if (!session?.user.isAdmin) {
        return {
            success: false,
            error: "No tienes permisos de administrador.",
        };
    }
    // Si pasa, retornamos `undefined`.
};