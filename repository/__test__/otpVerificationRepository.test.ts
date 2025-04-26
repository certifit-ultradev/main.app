// otpVerificationRepository.test.ts
import { prisma } from '../../lib/prisma';
import {
    findCurrentOtpVerificationByValue,
    createOtpVerification,
    deleteOtpVerificationById,
} from '../otp-verification';
import { OtpVerification } from '@/models/otp-verification';
import { CreateOtpVerification } from '@/utils/types';

jest.mock('../../lib/prisma');

describe("Otp Verification Repository Tests", () => {
    test('findCurrentOtpVerificationByValue debería retornar una verificación OTP si se encuentra', async () => {
        const mockOtpVerification = {
            id: '1',
            value: '123456789',
            code: '123456',
            status: 'pending',
        };

        (prisma.otpVerification.findFirst as jest.Mock).mockResolvedValue(mockOtpVerification);

        const result = await findCurrentOtpVerificationByValue('123456789');

        expect(prisma.otpVerification.findFirst).toHaveBeenCalledWith({
            where: { value: '123456789' },
        });
        expect(result).toEqual(new OtpVerification(mockOtpVerification));
    });

    test('findCurrentOtpVerificationByValue debería retornar null si no se encuentra', async () => {
        (prisma.otpVerification.findFirst as jest.Mock).mockResolvedValue(null);

        const result = await findCurrentOtpVerificationByValue('987654321');

        expect(prisma.otpVerification.findFirst).toHaveBeenCalledWith({
            where: { value: '987654321' },
        });
        expect(result).toBeNull();
    });

    test('findCurrentOtpVerificationByValue debería manejar excepciones', async () => {
        (prisma.otpVerification.findFirst as jest.Mock).mockRejectedValue(new Error('Error de base de datos'));

        await expect(findCurrentOtpVerificationByValue('123456789')).rejects.toThrow('Error de base de datos');
    });

    test('createOtpVerification debería crear una verificación OTP correctamente', async () => {
        const mockCreateOtp: CreateOtpVerification = {
            sid: "123",
            value: '123456789',
            status: 'pending',
            type: "sms",
            attempts: 0,
        };

        const mockCreatedOtp = {
            id: '1',
            ...mockCreateOtp,
        };

        (prisma.otpVerification.create as jest.Mock).mockResolvedValue(mockCreatedOtp);

        const result = await createOtpVerification(mockCreateOtp);

        expect(prisma.otpVerification.create).toHaveBeenCalledWith({ data: mockCreateOtp });
        expect(result).toEqual(mockCreatedOtp);
    });

    test('createOtpVerification debería manejar excepciones', async () => {
        const mockCreateOtp: CreateOtpVerification = {
            sid: "123",
            value: '123456789',
            status: 'pending',
            type: "sms",
            attempts: 0,
        };

        (prisma.otpVerification.create as jest.Mock).mockRejectedValue(new Error('Error al crear OTP'));

        await expect(createOtpVerification(mockCreateOtp)).rejects.toThrow('Error al crear OTP');
    });

    test('deleteOtpVerificationById debería eliminar una verificación OTP correctamente', async () => {
        const mockDeletedOtp = {
            id: '1',
            value: '123456789',
            code: '123456',
            status: 'pending',
            attempts: 0,
        };

        (prisma.otpVerification.delete as jest.Mock).mockResolvedValue(mockDeletedOtp);

        const result = await deleteOtpVerificationById('1');

        expect(prisma.otpVerification.delete).toHaveBeenCalledWith({ where: { id: '1' } });
        expect(result).toBe(true);
    });

    test('deleteOtpVerificationById debería manejar excepciones', async () => {
        (prisma.otpVerification.delete as jest.Mock).mockRejectedValue(new Error('Error al eliminar OTP'));

        await expect(deleteOtpVerificationById('1')).rejects.toThrow('Error al eliminar OTP');
    });
});