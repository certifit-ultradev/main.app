import type { NextAuthConfig } from 'next-auth';

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
            }
            return token;
        },
        async session({ session, token }) {
            console.log("session func", typeof token);
            session.user.id = token.id;
            session.user.isAdmin = token.isAdmin;
            return session;
        }
    },
    providers: [],
} satisfies NextAuthConfig;