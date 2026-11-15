import { auth } from '@/auth';
import { EmailUnverifiedError, InsufficientRoleError } from '@/exceptions/actor-access-errors';
import { UserNotLoggedError } from '@/exceptions/user-not-logged';
import type { Session } from 'next-auth';

export type AuthenticatedActor = {
    id: string;
    email: string;
    emailVerified: Date | null;
    isAdmin?: boolean;
};

export type AuthenticatedSession = Session & { user: AuthenticatedActor & Session['user'] };
export type AuthenticationRequirements = { requireEmailVerified?: boolean; requireAdmin?: boolean };

export const getAuthenticatedActor = async (
    requirements: AuthenticationRequirements = {},
): Promise<AuthenticatedActor> => {
    const { requireEmailVerified = true, requireAdmin = false } = requirements;
    const session = await auth();
    if (!session?.user?.id) throw new UserNotLoggedError('El usuario debe iniciar sesión');
    if (requireEmailVerified && !session.user.emailVerified) throw new EmailUnverifiedError();
    if (requireAdmin && !session.user.isAdmin) throw new InsufficientRoleError();
    return {
        id: session.user.id,
        email: session.user.email ?? '',
        emailVerified: session.user.emailVerified ?? null,
        isAdmin: session.user.isAdmin,
    };
};

export function withAuthenticatedActor<TArgs extends unknown[], TReturn>(
    operation: (actor: AuthenticatedActor, ...args: TArgs) => Promise<TReturn>,
    requirements?: AuthenticationRequirements,
): (...args: TArgs) => Promise<TReturn> {
    return async (...args) => operation(await getAuthenticatedActor(requirements), ...args);
}

export const withAdminAuthenticatedActor = <TArgs extends unknown[], TReturn>(
    operation: (actor: AuthenticatedActor, ...args: TArgs) => Promise<TReturn>,
): ((...args: TArgs) => Promise<TReturn>) => withAuthenticatedActor(operation, { requireAdmin: true });

export const getOptionalAuthenticatedActorId = async (): Promise<string | null> => {
    try {
        return (await auth())?.user?.id ?? null;
    } catch {
        return null;
    }
};
