import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { getUserByEmail } from '@/services/user';
import bcrypt from "bcryptjs";

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    try {
                        const { email, password } = parsedCredentials.data;
                        const user = await getUserByEmail(email);
                        if (!user || !user.password) return null;
                        const passwordsMatch = await bcrypt.compare(password, user.password);

                        if (passwordsMatch) return user;
                    } catch (error) {
                        return null;
                    }
                }
                return null;
            },
        }),
    ],
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" }
});
