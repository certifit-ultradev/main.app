import { auth } from '@/auth';
import type { Session } from 'next-auth';
import { actionFailure, type ActionFailure, type ActionResult } from './action-result';

export type AuthenticatedActor = Readonly<{
    userId: string;
    email: string | null;
    emailVerifiedAt: Date | null;
    role: 'USER' | 'ADMIN';
}>;

export type ActionContext = Readonly<{ actor: AuthenticatedActor }>;

export async function requireAuthenticatedActionContext(): Promise<ActionContext | ActionFailure> {
    let session: Session | null;
    try {
        session = await auth();
    } catch {
        return actionFailure('UNEXPECTED', 'No fue posible validar la sesión.');
    }
    if (!session?.user?.id) {
        return actionFailure('UNAUTHENTICATED', 'Debes iniciar sesión para realizar esta acción.');
    }

    return Object.freeze({
        actor: Object.freeze({
            userId: session.user.id,
            email: session.user.email ?? null,
            emailVerifiedAt: session.user.emailVerified ?? null,
            role: session.user.isAdmin ? 'ADMIN' : 'USER',
        }),
    });
}

export async function requireVerifiedUserActionContext(): Promise<ActionContext | ActionFailure> {
    const context = await requireAuthenticatedActionContext();
    if (isActionFailure(context)) return context;
    if (!context.actor.emailVerifiedAt) {
        return actionFailure('EMAIL_UNVERIFIED', 'Debes verificar tu email para realizar esta acción.');
    }
    return context;
}

export async function requireAdminActionContext(): Promise<ActionContext | ActionFailure> {
    const context = await requireAuthenticatedActionContext();
    if (isActionFailure(context)) return context;
    if (context.actor.role !== 'ADMIN') {
        return actionFailure('FORBIDDEN', 'No tienes permisos de administrador.');
    }
    if (!context.actor.emailVerifiedAt) {
        return actionFailure('EMAIL_UNVERIFIED', 'Debes verificar tu email para realizar esta acción.');
    }
    return context;
}

export function isActionFailure(value: ActionContext | ActionFailure): value is ActionFailure {
    return !('actor' in value);
}

/**
 * Runs a protected action only after its actor has been resolved once.
 * The callback receives the immutable actor context instead of a request
 * object mutated by middleware.
 */
export async function withAdminAction<T>(
    handler: (context: ActionContext) => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
    const context = await requireAdminActionContext();
    return isActionFailure(context) ? context : handler(context);
}

export async function withAuthenticatedAction<T>(
    handler: (context: ActionContext) => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
    const context = await requireAuthenticatedActionContext();
    return isActionFailure(context) ? context : handler(context);
}
