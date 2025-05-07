import { ServerActionRequest, ServerActionResponse } from "@/utils/types";
import { Middleware } from "../server-action-middleware";
import { auth } from "@/auth";

/**
 * isAdminMiddleware revisa si `session.user.emailVerified` es true.
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
};

/**
 * isEmailVerifiedMiddleware revisa si `session.user.emailVerified` es true.
 * Si no lo es, retorna un error abortando la acción.
 */
export const isEmailVerified: Middleware<any> = async (
    req: ServerActionRequest<any>
): Promise<ServerActionResponse<any> | undefined> => {
    const session = await auth();
    if (!session?.user.emailVerified) {
        return {
            success: false,
            error: "No eres un usuario activo.",
        };
    }
};