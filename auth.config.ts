import type { NextAuthConfig } from 'next-auth';
import { REMEMBERED_SESSION_SECONDS, sessionDeadline } from '@/shared/auth/session-lifetime';

export const toVerifiedDate = (value: unknown): Date | null => {
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    if (typeof value !== 'string') return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const authConfig: NextAuthConfig = {
    session: { strategy: 'jwt', maxAge: REMEMBERED_SESSION_SECONDS },
    pages: {
        signIn: '/login',
        signOut: '/logout'
    },
    callbacks: {
        authorized({ auth }) {
            return !!auth?.user;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.isAdmin = user.isAdmin ?? false;
                token.emailVerified = user.emailVerified ?? null;
                token.sessionDeadline = sessionDeadline(user.rememberMe === true);
            }
            if (typeof token.sessionDeadline === 'number' && Date.now() >= token.sessionDeadline) return null;
            return token;
        },
        async session({ session, token }) {
            session.user.id = typeof token.id === 'string' ? token.id : "";
            session.user.isAdmin = typeof token.isAdmin === 'boolean' ? token.isAdmin : false;
            session.user.emailVerified = toVerifiedDate(token.emailVerified);
            return typeof token.sessionDeadline === 'number'
                ? { ...session, expires: new Date(token.sessionDeadline).toISOString() }
                : session;
        }
    },
    providers: [],
} satisfies NextAuthConfig;
