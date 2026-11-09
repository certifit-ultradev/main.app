import type { NextAuthConfig } from 'next-auth';

export const toVerifiedDate = (value: unknown): Date | null => {
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    if (typeof value !== 'string') return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const authConfig: NextAuthConfig = {
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
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = typeof token.id === 'string' ? token.id : "";
            session.user.isAdmin = typeof token.isAdmin === 'boolean' ? token.isAdmin : false;
            session.user.emailVerified = toVerifiedDate(token.emailVerified);
            return session;
        }
    },
    providers: [],
} satisfies NextAuthConfig;
