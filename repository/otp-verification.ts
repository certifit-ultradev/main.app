import { prisma } from "../lib/prisma";
import type { NewOtpVerification, OtpVerificationRecord } from '@/application/identity/identity-token.records';
import { NotFoundError } from "@/exceptions/not-found";

/**
 * 
 * @param phoneNumber 
 * @returns 
 */
export const findCurrentOtpVerificationByValue = async (phoneNumber: string): Promise<OtpVerificationRecord> => {
    const otpVerification = await prisma.otpVerification.findFirst({ where: { value: phoneNumber } });
    if (!otpVerification) {
        throw new NotFoundError('Otp no encontrada');
    }

    return otpVerification;
}

/**
 * 
 * @param otp 
 * @returns 
 */
export const createOtpVerification = async (otp: NewOtpVerification): Promise<OtpVerificationRecord | null> => {
    return await prisma.otpVerification.create({ data: otp });
}

/**
 * 
 * @param id 
 * @returns 
 */
export const deleteOtpVerificationById = async (id: string): Promise<boolean> => {
    const deletedOtp = await prisma.otpVerification.delete({ where: { id: id } });
    if (deletedOtp) {
        return true;
    }

    return false;
}
