import {
    createSmsVerificationCode,
    validateSmsVerificationCode,
} from '../sms-otp';
import { twilio } from '../../lib/twilio';
import * as otpVerificationRepo from '../otp-verification';
import { OtpVerification } from '@/models/otp-verification';

jest.mock('../../lib/twilio');
jest.mock('../otp-verification');

const mockPhoneNumber = '+1234567890';
const mockVerificationCode = '123456';
const mockSid = 'SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const mockStatus = 'pending';
const mockApprovedStatus = 'approved';

describe("Sms Otp Repository", () => {
    test('createSmsVerificationCode debería crear un código de verificación por SMS exitosamente', async () => {
        process.env.TWILIO_VERIFY_SERVICE = 'VA123456789';
        process.env.APP_ENV = 'PROD';

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
            value: mockPhoneNumber,
        });

        const result = await createSmsVerificationCode(mockPhoneNumber);

        expect(twilio.verify.v2.services).toHaveBeenCalledWith('VA123456789');
        expect(twilio.verify.v2.services().verifications.create).toHaveBeenCalledWith({
            channel: 'sms',
            to: mockPhoneNumber,
        });

        expect(otpVerificationRepo.createOtpVerification).toHaveBeenCalledWith({
            sid: mockSid,
            type: 'sms',
            attempts: 2,
            status: mockStatus,
            value: mockPhoneNumber,
        });

        expect(result).toBeInstanceOf(OtpVerification);
        expect(result.sid).toBe(mockSid);
        expect(result.status).toBe(mockStatus);
    });

    test('createSmsVerificationCode debería aprobar automáticamente el código en entorno de desarrollo', async () => {
        process.env.TWILIO_VERIFY_SERVICE = 'VA123456789';
        process.env.APP_ENV = 'DEV';

        // Mock de findCurrentOtpVerificationByValue
        (otpVerificationRepo.findCurrentOtpVerificationByValue as jest.Mock).mockResolvedValue({
            sid: mockSid,
        });

        // Mock de Twilio update
        (twilio.verify.v2.services().verifications as jest.Mock).mockReturnThis();
        (twilio.verify.v2.services().verifications().update as jest.Mock).mockResolvedValue({
            sid: mockSid,
            status: mockApprovedStatus,
        });

        // Mock de Twilio create
        (twilio.verify.v2.services().verifications.create as jest.Mock).mockResolvedValue({
            sid: mockSid,
            status: mockStatus,
            sendCodeAttempts: [{}],
        });

        // Mock de createOtpVerification
        (otpVerificationRepo.createOtpVerification as jest.Mock).mockResolvedValue({
            id: '1',
            sid: mockSid,
            type: 'sms',
            attempts: 1,
            status: mockStatus,
            value: mockPhoneNumber,
        });

        const result = await createSmsVerificationCode(mockPhoneNumber);

        expect(twilio.verify.v2.services().verifications).toHaveBeenCalledWith('VA123456789');
        expect(twilio.verify.v2.services().verifications().update).toHaveBeenCalledWith({ status: 'approved' });
        expect(twilio.verify.v2.services().verifications.create).toHaveBeenCalledWith({
            channel: 'sms',
            to: mockPhoneNumber,
        });

        expect(otpVerificationRepo.createOtpVerification).toHaveBeenCalledWith({
            sid: mockSid,
            type: 'sms',
            attempts: 1,
            status: mockStatus,
            value: mockPhoneNumber,
        });

        expect(result).toBeInstanceOf(OtpVerification);
        expect(result.sid).toBe(mockSid);
        expect(result.status).toBe(mockStatus);
    });

    test('createSmsVerificationCode debería lanzar un error si TWILIO_VERIFY_SERVICE no está definido', async () => {
        delete process.env.TWILIO_VERIFY_SERVICE;

        await expect(createSmsVerificationCode(mockPhoneNumber)).rejects.toThrow('error sending sms');
    });

});