import NextAuth, { Session } from "next-auth";
import { authConfig } from '@/auth.config';

import {
    DEFAULT_LOGIN_REDIRECT,
    apiRoute,
    authRoutes,
    publicRoutes,
    adminRoute,
    videoRoute,
    videoApiRoute
} from "@/routes";
import { NextURL } from "next/dist/server/web/next-url";

const { auth } = NextAuth(authConfig);
export default auth((req: { auth?: Session |null; nextUrl?: NextURL; headers: Headers }) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    if (!nextUrl) {
        return;
    }

    if (!req.auth?.user?.emailVerified) {
        return Response.redirect(new URL('/verify-email', nextUrl));
    }

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiRoute);
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);
    const isAdmiRoute = nextUrl.pathname.startsWith(adminRoute);
    const isVideoRoute = nextUrl.pathname.startsWith(videoRoute) || nextUrl.pathname.startsWith(videoApiRoute);
    if (isApiAuthRoute) {
        return;
    }

    const isAdmin = req.auth?.user?.isAdmin;
    if (isVideoRoute) {
        if (!isLoggedIn) {
            return Response.redirect(new URL('/login', nextUrl));
        }
        return;
    }

    if (isAuthRoute) {
        if (isLoggedIn) {
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
        }
        return;
    }

    if (isAdmiRoute) {
        if (!isLoggedIn) {
            return Response.redirect(new URL('/login', nextUrl));
        }
        if (!isAdmin) {
            return Response.redirect(new URL('/dashboard', nextUrl));
        }
        return;
    }

    if (!isLoggedIn && !isPublicRoute) {
        let callbackUrl = nextUrl.pathname;
        if (nextUrl.search) {
            callbackUrl += nextUrl.search;
        }

        const encodedCallbackUrl = encodeURIComponent(callbackUrl);

        return Response.redirect(
            new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
        );
    }

    return;
})

// See "Matching Paths" below to learn more
export const config = {
    //matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
    matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)'
}