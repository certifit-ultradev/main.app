import { auth } from "@/auth";
import { UserNotLoggedError } from "@/exceptions/user-not-logged";
import { Session } from "next-auth";

/**
 * Tipo para usuario autenticado y verificado
 */
export interface AuthenticatedUser {
    id: string;
    email: string;
    emailVerified: Date;
    isAdmin?: boolean;
}

/**
 * Tipo para sesión con usuario autenticado
 */
export interface AuthenticatedSession extends Session {
    user: AuthenticatedUser & Session['user'];
}

/**
 * Opciones de configuración para el wrapper de autenticación
 */
export interface AuthOptions {
    /** Requiere que el email esté verificado (default: true) */
    requireEmailVerified?: boolean;
    /** Requiere que sea administrador (default: false) */
    requireAdmin?: boolean;
}

/**
 * Valida la sesión del usuario y retorna los datos del usuario autenticado
 * @throws UserNotLoggedError si el usuario no está autenticado o no cumple los requisitos
 */
export const getAuthenticatedUser = async (
    options: AuthOptions = {}
): Promise<AuthenticatedUser> => {
    const { requireEmailVerified = true, requireAdmin = false } = options;

    const session = await auth();

    if (!session?.user?.id) {
        throw new UserNotLoggedError("El usuario debe iniciar sesión");
    }

    if (requireEmailVerified && !session.user.emailVerified) {
        throw new UserNotLoggedError("El usuario debe verificar su email");
    }

    if (requireAdmin && !session.user.isAdmin) {
        throw new UserNotLoggedError("Se requieren permisos de administrador");
    }

    return {
        id: session.user.id,
        email: session.user.email ?? '',
        emailVerified: session.user.emailVerified as Date,
        isAdmin: session.user.isAdmin,
    };
};

/**
 * Higher-Order Function que envuelve una función con validación de autenticación
 * 
 * @example
 * export const getUserCourses = withAuth(async (user, page: number) => {
 *     return await findUserCourses(user.id, page);
 * });
 */
export function withAuth<TArgs extends unknown[], TReturn>(
    fn: (user: AuthenticatedUser, ...args: TArgs) => Promise<TReturn>,
    options?: AuthOptions
): (...args: TArgs) => Promise<TReturn> {
    return async (...args: TArgs): Promise<TReturn> => {
        const user = await getAuthenticatedUser(options);
        return fn(user, ...args);
    };
}

/**
 * Higher-Order Function para funciones que requieren admin
 */
export function withAdminAuth<TArgs extends unknown[], TReturn>(
    fn: (user: AuthenticatedUser, ...args: TArgs) => Promise<TReturn>
): (...args: TArgs) => Promise<TReturn> {
    return withAuth(fn, { requireAdmin: true });
}

/**
 * Obtiene el ID del usuario autenticado o null si no hay sesión
 * Útil para funciones que tienen comportamiento diferente para usuarios autenticados
 */
export const getOptionalUserId = async (): Promise<string | null> => {
    try {
        const session = await auth();
        return session?.user?.id ?? null;
    } catch {
        return null;
    }
};
