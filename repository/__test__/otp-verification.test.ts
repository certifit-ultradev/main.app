import { NotFoundError } from '@/exceptions/not-found';
import { prisma } from '@/lib/prisma';
import {
    createOtpVerification,
    deleteOtpVerificationById,
    findCurrentOtpVerificationByValue,
} from '@/repository/otp-verification';

jest.mock('@/lib/prisma', () => ({
    prisma: {
        otpVerification: {
            findFirst: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

describe('OTP verification repository records', () => {
    const record = { id: 'otp-1', sid: 'sid-1', value: '573001234567', attempts: 0, type: 'sms', status: 'pending' };

    beforeEach(() => jest.clearAllMocks());

    it('returns the persisted record and does not construct a model', async () => {
        (prisma.otpVerification.findFirst as jest.Mock).mockResolvedValue(record);
        await expect(findCurrentOtpVerificationByValue(record.value)).resolves.toEqual(record);
    });

    it('keeps not found as an application error for the required OTP lookup', async () => {
        (prisma.otpVerification.findFirst as jest.Mock).mockResolvedValue(null);
        await expect(findCurrentOtpVerificationByValue('missing')).rejects.toThrow(NotFoundError);
    });

    it('creates and deletes records with closed commands', async () => {
        const input = { sid: record.sid, value: record.value, attempts: record.attempts, type: record.type, status: record.status };
        (prisma.otpVerification.create as jest.Mock).mockResolvedValue(record);
        (prisma.otpVerification.delete as jest.Mock).mockResolvedValue(record);

        await expect(createOtpVerification(input)).resolves.toEqual(record);
        await expect(deleteOtpVerificationById(record.id)).resolves.toBe(true);
    });
});
