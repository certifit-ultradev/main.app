import { UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            isAdmin: boolean;
        } & DefaultSession["user"];
    }


    interface User {
        id: string;
        isAdmin: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        isAdmin: boolean;
    }
}