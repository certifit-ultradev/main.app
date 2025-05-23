import { NotFoundError } from "@/exceptions/not-found";
import { prisma } from "@/lib/prisma";
import { VerificationToken } from "@/models/verification-token";

/**
 * 
 * @param token 
 * @returns 
 */
export const findVerificationTokenByToken = async (token: string): Promise<VerificationToken> => {
    const verificationToken = await prisma.verificationToken.findUnique({
        where: { token },
    });

    if (!verificationToken) {
        throw new NotFoundError('Token de verificación no encontrado');
    }

    return new VerificationToken(verificationToken);
};

/**
 * 
 * @param email 
 * @returns 
 */
export const findVertificationTokenByEmail = async (email: string): Promise<VerificationToken> => {
    const verificationToken = await prisma.verificationToken.findFirst({
        where: { email },
    });

    if (!verificationToken) {
        throw new NotFoundError('Token de verificación no encontrado');
    }

    return new VerificationToken(verificationToken);
}

/**
 * 
 * @param phoneNumber 
 * @returns 
 */
export const createVerificationToken = async (verification: VerificationToken): Promise<VerificationToken | null> => {
    const verificationToken = await prisma.verificationToken.create({
        data: verification
    });

    if (!verificationToken) {
        return null;
    }

    return new VerificationToken(verificationToken);
}

/**
 * 
 * @param id 
 * @returns 
 */
export const deleteVerificationToken = async (id: string) => {
    return await prisma.verificationToken.delete({
        where: { id },
    });
}