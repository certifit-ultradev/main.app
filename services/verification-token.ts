import type { VerificationTokenRecord } from '@/application/identity/identity-token.records';
import { ONE_HOUR_IDENTITY_TOKEN_TTL } from '@/application/identity/identity-token.ports';
import { uuidIdentityTokenGenerator } from '@/infrastructure/identity/uuid-identity-token-generator';
import { createVerificationToken, deleteVerificationToken, findVerificationTokenByToken } from "@/repository/verification-token";
import { nodemailerEmailGateway } from '@/infrastructure/notifications/nodemailer-email-gateway';
import { executeService } from "@/utils/service-wrapper";
import { getUserByEmail } from './user';

/**
 * 
 * @param email 
 * @returns 
 */
export const generateVerificationTokenByEmail = async (email: string): Promise<VerificationTokenRecord | null> => {
    return executeService(() => {
        const { expires, token } = uuidIdentityTokenGenerator.generate(ONE_HOUR_IDENTITY_TOKEN_TTL);
        return createVerificationToken({ email, token, expires });
    });
}

/**
 * 
 * @param token 
 * @returns 
 */
export const getVerificationTokenByToken = async (token: string): Promise<VerificationTokenRecord | null> => {
    return executeService(() => {
        if (token === "") {
            throw new Error("El token de verificación no puede ser vacío");
        }

        return findVerificationTokenByToken(token);
    });
}

/** Sends mail only for an existing, unverified account; callers receive a neutral acknowledgement. */
export const requestEmailVerification = async (email: string): Promise<void> => {
    const user = await getUserByEmail(email);
    if (!user || user.emailVerified) return;
    await sendVerificationEmailWithToken(email);
};

/**
 * 
 * @param email 
 * @returns 
 */
export const sendVerificationEmailWithToken = async (email: string): Promise<void> => {
    const verificationToken = await executeService(async () => {
        const token = await generateVerificationTokenByEmail(email);
        if (!token) {
            throw new Error("el token no se pudo generar");
        }
        return token;
    });

    await executeService(() => nodemailerEmailGateway.sendVerificationLink({ email, token: verificationToken.token }));

}

/**
 * 
 * @param id 
 * @returns 
 */
export const removeVerificationToken = async (id: string): Promise<void> => {
    await executeService(() => deleteVerificationToken(id));
}
