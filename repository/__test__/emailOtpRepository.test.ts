// emailOtpRepository.test.ts
import { createEmailVerificationCode, validateEmailVerificationCode } from '../email-otp';
import { twilio } from '../../lib/twilio';
import * as otpVerificationRepo from '../otp-verification';
import { OtpVerification } from '@/models/otp-verification';

jest.mock('../../lib/twilio');
jest.mock('../otp-verification');

const mockEmail = 'test@example.com';
const mockVerificationCode = '123456';
const mockSid = 'SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const mockStatus = 'pending';

describe("Email Otp Repository Tests", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('createEmailVerificationCode debería crear un código de verificación por correo electrónico exitosamente', async () => {
        process.env.TWILIO_VERIFY_SERVICE = 'VA123456789';

        // Mock de Twilio
        (twilio.verify.v2.services().verifications.create as jest.Mock).mockResolvedValue({
            sid: mockSid,
            status: mockStatus,
            sendCodeAttempts: [{}, {}], // Simula dos intentos
        });

        // Mock de createOtpVerification
        (otpVerificationRepo.createOtpVerification as jest.Mock).mockResolvedValue({
            id: '1',
            sid: mockSid,
            type: 'sms',
            attempts: 2,
            status: mockStatus,
            value: mockEmail,
        });

        const result = await createEmailVerificationCode(mockEmail);

        expect(twilio.verify.v2.services).toHaveBeenCalledWith('VA123456789');
        expect(twilio.verify.v2.services().verifications.create).toHaveBeenCalledWith({
            channel: 'email',
            to: mockEmail,
        });

        expect(otpVerificationRepo.createOtpVerification).toHaveBeenCalledWith({
            sid: mockSid,
            type: 'sms',
            attempts: 2,
            status: mockStatus,
            value: mockEmail,
        });

        expect(result).toBeInstanceOf(OtpVerification);
        expect(result.sid).toBe(mockSid);
        expect(result.status).toBe(mockStatus);
    });

    test('createEmailVerificationCode debería lanzar un error si TWILIO_VERIFY_SERVICE no está definido', async () => {
        delete process.env.TWILIO_VERIFY_SERVICE;

        await expect(createEmailVerificationCode(mockEmail)).rejects.toThrow('error sending sms');
    });

    test('validateEmailVerificationCode debería validar correctamente el código', async () => {
        process.env.TWILIO_VERIFY_SERVICE = 'VA123456789';

        // Mock de Twilio
        (twilio.verify.v2.services().verificationChecks.create as jest.Mock).mockResolvedValue({
            status: 'approved',
        });

        // Mock de findCurrentOtpVerificationByValue
        (otpVerificationRepo.findCurrentOtpVerificationByValue as jest.Mock).mockResolvedValue({
            id: '1',
        });

        // Mock de deleteOtpVerificationById
        (otpVerificationRepo.deleteOtpVerificationById as jest.Mock).mockResolvedValue(true);

        const result = await validateEmailVerificationCode(mockEmail, mockVerificationCode);

        expect(twilio.verify.v2.services).toHaveBeenCalledWith('VA123456789');
        expect(twilio.verify.v2.services().verificationChecks.create).toHaveBeenCalledWith({
            code: mockVerificationCode,
            to: mockEmail,
        });

        expect(otpVerificationRepo.findCurrentOtpVerificationByValue).toHaveBeenCalledWith(mockEmail);
        expect(otpVerificationRepo.deleteOtpVerificationById).toHaveBeenCalledWith('1');

        expect(result).toBe('approved');
    });

    test('validateEmailVerificationCode debería manejar el caso cuando no existe una verificación OTP actual', async () => {
        process.env.TWILIO_VERIFY_SERVICE = 'VA123456789';

        (twilio.verify.v2.services().verificationChecks.create as jest.Mock).mockResolvedValue({
            status: 'approved',
        });

        // Mock de findCurrentOtpVerificationByValue devuelve null
        (otpVerificationRepo.findCurrentOtpVerificationByValue as jest.Mock).mockResolvedValue(null);

        const result = await validateEmailVerificationCode(mockEmail, mockVerificationCode);

        expect(otpVerificationRepo.findCurrentOtpVerificationByValue).toHaveBeenCalledWith(mockEmail);
        expect(otpVerificationRepo.deleteOtpVerificationById).not.toHaveBeenCalled();

        expect(result).toBe('approved');
    });

    test('validateEmailVerificationCode debería lanzar un error si TWILIO_VERIFY_SERVICE no está definido', async () => {
        delete process.env.TWILIO_VERIFY_SERVICE;

        await expect(validateEmailVerificationCode(mockEmail, mockVerificationCode)).rejects.toThrow('error sending sms');
    });

    test('validateEmailVerificationCode debería manejar errores al validar el código en Twilio', async () => {
        process.env.TWILIO_VERIFY_SERVICE = 'VA123456789';

        (twilio.verify.v2.services().verificationChecks.create as jest.Mock).mockRejectedValue(new Error('Twilio error'));

        await expect(validateEmailVerificationCode(mockEmail, mockVerificationCode)).rejects.toThrow('Twilio error');
    });

})