import { OtpVerification } from "@/models/otp-verification";
import { prisma } from "../lib/prisma";
import { CreateOtpVerification } from "@/utils/types";
import { NotFoundError } from "@/exceptions/not-found";

/**
 * 
 * @param phoneNumber 
 * @returns 
 */
export const findCurrentOtpVerificationByValue = async (phoneNumber: string): Promise<OtpVerification> => {
    const otpVerification = await prisma.otpVerification.findFirst({ where: { value: phoneNumber } });
    if (!otpVerification) {
        throw new NotFoundError('Otp no encontrada');
    }

    return new OtpVerification({ ...otpVerification });
}

/**
 * 
 * @param otp 
 * @returns 
 */
export const createOtpVerification = async (otp: CreateOtpVerification): Promise<OtpVerification | null> => {
    return await prisma.otpVerification.create({ data: otp });
}

/**
 * 
 * @param id 
 * @returns 
 */
export const deleteOtpVerificationById = async (id: string): Promise<Boolean> => {
    const deletedOtp = await prisma.otpVerification.delete({ where: { id: id } });
    if (deletedOtp) {
        return true;
    }

    return false;
}