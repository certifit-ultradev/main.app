import { prisma } from "@/lib/prisma";
import type { NewVerificationToken, VerificationTokenRecord } from '@/application/identity/identity-token.records';

/**
 * 
 * @param token 
 * @returns 
 */
export const findVerificationTokenByToken = async (token: string): Promise<VerificationTokenRecord | null> => {
    const verificationToken = await prisma.verificationToken.findUnique({
        where: { token },
    });

    return verificationToken;
};

/**
 * 
 * @param email 
 * @returns 
 */
export const findVerificationTokenByEmail = async (email: string): Promise<VerificationTokenRecord | null> => {
    const verificationToken = await prisma.verificationToken.findFirst({
        where: { email },
    });

    return verificationToken;
}

/**
 * 
 * @param phoneNumber 
 * @returns 
 */
export const createVerificationToken = async (verification: NewVerificationToken): Promise<VerificationTokenRecord | null> => {
    const verificationToken = await prisma.verificationToken.create({
        data: verification
    });

    if (!verificationToken) {
        return null;
    }

    return verificationToken;
}

/**
 * 
 * @param id 
 * @returns 
 */
export const deleteVerificationToken = async (id: string): Promise<VerificationTokenRecord> => {
    return await prisma.verificationToken.delete({
        where: { id },
    });
}
