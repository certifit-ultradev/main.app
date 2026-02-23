import { ServerActionRequest, ServerActionResponse } from "@/utils/types";
import { Middleware } from "../server-action-middleware";
import { auth } from "@/auth";
import { AuthenticatedUser } from "@/utils/auth-wrapper";

/**
 * Extiende el request para incluir datos del usuario autenticado
 */
export interface AuthenticatedRequest<T> extends ServerActionRequest<T> {
    user?: AuthenticatedUser;
}

/**
 * Middleware que requiere que el usuario esté autenticado.
 * Adjunta los datos del usuario al request para uso downstream.
 */
export const requireAuth: Middleware<any> = async (
    req: AuthenticatedRequest<any>
): Promise<ServerActionResponse<any> | undefined> => {
    const session = await auth();
    
    if (!session?.user?.id) {
        return {
            success: false,
            error: "Debes iniciar sesión para realizar esta acción.",
        };
    }

    // Adjuntar usuario al request para uso en la acción final
    req.user = {
        id: session.user.id,
        email: session.user.email ?? '',
        emailVerified: session.user.emailVerified as Date,
        isAdmin: session.user.isAdmin,
    };
};

/**
 * Middleware que requiere permisos de administrador.
 * Debe usarse después de requireAuth.
 */
export const isAdmin: Middleware<any> = async (
    req: AuthenticatedRequest<any>
): Promise<ServerActionResponse<any> | undefined> => {
    const session = await auth();
    
    if (!session?.user?.id) {
        return {
            success: false,
            error: "Debes iniciar sesión para realizar esta acción.",
        };
    }

    if (!session.user.isAdmin) {
        return {
            success: false,
            error: "No tienes permisos de administrador.",
        };
    }

    // Adjuntar usuario al request
    req.user = {
        id: session.user.id,
        email: session.user.email ?? '',
        emailVerified: session.user.emailVerified as Date,
        isAdmin: session.user.isAdmin,
    };
};

/**
 * Middleware que requiere que el email esté verificado.
 * Incluye la verificación de autenticación.
 */
export const isEmailVerified: Middleware<any> = async (
    req: AuthenticatedRequest<any>
): Promise<ServerActionResponse<any> | undefined> => {
    const session = await auth();
    
    if (!session?.user?.id) {
        return {
            success: false,
            error: "Debes iniciar sesión para realizar esta acción.",
        };
    }

    if (!session.user.emailVerified) {
        return {
            success: false,
            error: "Debes verificar tu email para realizar esta acción.",
        };
    }

    // Adjuntar usuario al request
    req.user = {
        id: session.user.id,
        email: session.user.email ?? '',
        emailVerified: session.user.emailVerified as Date,
        isAdmin: session.user.isAdmin,
    };
};

/**
 * Middleware combinado: requiere autenticación + email verificado
 * Es el reemplazo directo del patrón repetido en los servicios
 */
export const requireVerifiedUser: Middleware<any> = async (
    req: AuthenticatedRequest<any>
): Promise<ServerActionResponse<any> | undefined> => {
    const session = await auth();
    
    if (!session?.user?.id) {
        return {
            success: false,
            error: "El usuario debe iniciar sesión.",
        };
    }

    if (!session.user.emailVerified) {
        return {
            success: false,
            error: "El usuario debe verificar su email.",
        };
    }

    // Adjuntar usuario al request
    req.user = {
        id: session.user.id,
        email: session.user.email ?? '',
        emailVerified: session.user.emailVerified as Date,
        isAdmin: session.user.isAdmin,
    };
};

/**
 * Middleware combinado: requiere admin + email verificado
 * Reemplaza el patrón [isAdmin, isEmailVerified]
 */
export const requireAdminVerifiedUser: Middleware<any> = async (
    req: AuthenticatedRequest<any>
): Promise<ServerActionResponse<any> | undefined> => {
    const session = await auth();
    
    if (!session?.user?.id) {
        return {
            success: false,
            error: "Debes iniciar sesión para realizar esta acción.",
        };
    }

    if (!session.user.isAdmin) {
        return {
            success: false,
            error: "No tienes permisos de administrador.",
        };
    }

    if (!session.user.emailVerified) {
        return {
            success: false,
            error: "Debes verificar tu email para realizar esta acción.",
        };
    }

    // Adjuntar usuario al request
    req.user = {
        id: session.user.id,
        email: session.user.email ?? '',
        emailVerified: session.user.emailVerified as Date,
        isAdmin: session.user.isAdmin,
    };
};