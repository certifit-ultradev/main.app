import { OtpVerification } from "@/models/otp-verification";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/exceptions/not-found";
import {
    findCurrentOtpVerificationByValue,
    createOtpVerification,
    deleteOtpVerificationById
} from '@/repository/otp-verification';
import { CreateOtpVerification } from "@/utils/types";

jest.mock('@/lib/prisma', () => ({
    prisma: {
        otpVerification: {
            findFirst: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
        }
    }
}));

jest.mock('@/models/otp-verification');

describe('OTP Verification Repository Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findCurrentOtpVerificationByValue', () => {
        test('debería retornar un OtpVerification cuando existe', async () => {
            const mockOtp = {
                id: 'otp-123',
                sid: 'sid-123',
                value: '+57 300 1234567',
                type: 'sms',
                status: 'pending',
                attempts: 0,
            };
            const mockOtpInstance = { ...mockOtp };

            (prisma.otpVerification.findFirst as jest.Mock).mockResolvedValue(mockOtp);
            (OtpVerification as jest.Mock).mockImplementation(() => mockOtpInstance);

            const result = await findCurrentOtpVerificationByValue('+57 300 1234567');

            expect(prisma.otpVerification.findFirst).toHaveBeenCalledWith({
                where: { value: '+57 300 1234567' }
            });
            expect(OtpVerification).toHaveBeenCalledWith({ ...mockOtp });
            expect(result).toEqual(mockOtpInstance);
        });

        test('debería lanzar NotFoundError cuando el OTP no existe', async () => {
            (prisma.otpVerification.findFirst as jest.Mock).mockResolvedValue(null);

            await expect(findCurrentOtpVerificationByValue('+57 300 9999999'))
                .rejects
                .toThrow(NotFoundError);
            
            expect(prisma.otpVerification.findFirst).toHaveBeenCalledWith({
                where: { value: '+57 300 9999999' }
            });
        });

        test('debería buscar correctamente por diferentes números de teléfono', async () => {
            const phoneNumbers = ['+57 310 1111111', '+57 320 2222222', '+57 315 3333333'];
            
            for (const phoneNumber of phoneNumbers) {
                const mockOtp = {
                    id: `otp-${phoneNumber}`,
                    sid: 'sid-test',
                    value: phoneNumber,
                    type: 'sms',
                    status: 'approved',
                    attempts: 1,
                };

                (prisma.otpVerification.findFirst as jest.Mock).mockResolvedValue(mockOtp);
                (OtpVerification as jest.Mock).mockImplementation(() => ({ ...mockOtp }));

                await findCurrentOtpVerificationByValue(phoneNumber);

                expect(prisma.otpVerification.findFirst).toHaveBeenCalledWith({
                    where: { value: phoneNumber }
                });
            }
        });
    });

    describe('createOtpVerification', () => {
        test('debería crear y retornar un nuevo OTP verification', async () => {
            const newOtp: CreateOtpVerification = {
                sid: 'sid-789012',
                value: '+57 300 1234567',
                type: 'sms',
                status: 'pending',
                attempts: 0,
            };

            const mockCreatedOtp = {
                id: 'new-otp-123',
                ...newOtp,
            };

            (prisma.otpVerification.create as jest.Mock).mockResolvedValue(mockCreatedOtp);

            const result = await createOtpVerification(newOtp);

            expect(prisma.otpVerification.create).toHaveBeenCalledWith({
                data: newOtp
            });
            expect(result).toEqual(mockCreatedOtp);
        });

        test('debería retornar null si la creación falla', async () => {
            const newOtp: CreateOtpVerification = {
                sid: 'sid-111111',
                value: '+57 300 1234567',
                type: 'sms',
                status: 'pending',
                attempts: 0,
            };

            (prisma.otpVerification.create as jest.Mock).mockResolvedValue(null);

            const result = await createOtpVerification(newOtp);

            expect(result).toBeNull();
            expect(prisma.otpVerification.create).toHaveBeenCalledWith({
                data: newOtp
            });
        });

        test('debería manejar errores durante la creación', async () => {
            const newOtp: CreateOtpVerification = {
                sid: 'sid-222222',
                value: '+57 300 1234567',
                type: 'sms',
                status: 'pending',
                attempts: 0,
            };

            const error = new Error('Database error');
            (prisma.otpVerification.create as jest.Mock).mockRejectedValue(error);

            await expect(createOtpVerification(newOtp)).rejects.toThrow('Database error');
            expect(prisma.otpVerification.create).toHaveBeenCalledWith({
                data: newOtp
            });
        });

        test('debería crear OTP con diferentes sids', async () => {
            const otpSids = ['sid-123456', 'sid-654321', 'sid-999999'];

            for (const sid of otpSids) {
                const newOtp: CreateOtpVerification = {
                    sid: sid,
                    value: '+57 300 1234567',
                    type: 'sms',
                    status: 'pending',
                    attempts: 0,
                };

                const mockCreatedOtp = {
                    id: `otp-${sid}`,
                    ...newOtp,
                };

                (prisma.otpVerification.create as jest.Mock).mockResolvedValue(mockCreatedOtp);

                const result = await createOtpVerification(newOtp);

                expect(result?.sid).toBe(sid);
                expect(prisma.otpVerification.create).toHaveBeenCalledWith({
                    data: newOtp
                });
            }
        });
    });

    describe('deleteOtpVerificationById', () => {
        test('debería eliminar un OTP y retornar true cuando existe', async () => {
            const otpId = 'otp-to-delete-123';
            const mockDeletedOtp = {
                id: otpId,
                sid: 'sid-delete',
                value: '+57 300 1234567',
                type: 'sms',
                status: 'approved',
                attempts: 1,
            };

            (prisma.otpVerification.delete as jest.Mock).mockResolvedValue(mockDeletedOtp);

            const result = await deleteOtpVerificationById(otpId);

            expect(prisma.otpVerification.delete).toHaveBeenCalledWith({
                where: { id: otpId }
            });
            expect(result).toBe(true);
        });

        test('debería retornar false cuando la eliminación falla', async () => {
            const otpId = 'non-existent-otp';

            (prisma.otpVerification.delete as jest.Mock).mockResolvedValue(null);

            const result = await deleteOtpVerificationById(otpId);

            expect(result).toBe(false);
            expect(prisma.otpVerification.delete).toHaveBeenCalledWith({
                where: { id: otpId }
            });
        });

        test('debería manejar errores durante la eliminación', async () => {
            const otpId = 'error-otp';
            const error = new Error('Delete failed');

            (prisma.otpVerification.delete as jest.Mock).mockRejectedValue(error);

            await expect(deleteOtpVerificationById(otpId)).rejects.toThrow('Delete failed');
            expect(prisma.otpVerification.delete).toHaveBeenCalledWith({
                where: { id: otpId }
            });
        });

        test('debería eliminar múltiples OTPs correctamente', async () => {
            const otpIds = ['otp-1', 'otp-2', 'otp-3'];

            for (const id of otpIds) {
                const mockDeletedOtp = {
                    id,
                    sid: 'sid-multiple',
                    value: '+57 300 0000000',
                    type: 'sms',
                    status: 'approved',
                    attempts: 2,
                };

                (prisma.otpVerification.delete as jest.Mock).mockResolvedValue(mockDeletedOtp);

                const result = await deleteOtpVerificationById(id);

                expect(result).toBe(true);
                expect(prisma.otpVerification.delete).toHaveBeenCalledWith({
                    where: { id }
                });
            }
        });
    });
});
