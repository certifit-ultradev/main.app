import * as smsOtpRepository from '@/repository/sms-otp';
import * as emailOtpRepository from '@/repository/email-otp';

import {
    sendSmsVerificatioCode,
    checkSmsVerificationCode,
    sendEmailVerificatioCoden,
    checkEmailVerificationCode,
} from '@/services/verification-otp';

jest.mock('@/repository/email-otp');
jest.mock('@/repository/sms-otp');

const { createSmsVerificationCode, validateSmsVerificationCode } = smsOtpRepository;
const { createEmailVerificationCode, validateEmailVerificationCode } = emailOtpRepository;

const APPROVED_STATUS = "approved";
const PENDING_STATUS = "pending";

type OtpStatus = 'pending' | 'approved' | 'canceled' | 'max_attempts_reached' | 'deleted' | 'failed' | 'expired' | "error";

describe('Verification Otp Service Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('sendSmsVerificatioCode debería enviar un código de verificación exitosamente', async () => {
        const mockOtp = { status: PENDING_STATUS, attempts: 1 };
        (smsOtpRepository.createSmsVerificationCode as jest.Mock).mockResolvedValue(mockOtp);

        const result = await sendSmsVerificatioCode('123456789');

        expect(smsOtpRepository.createSmsVerificationCode).toHaveBeenCalledWith('123456789');
        expect(result).toEqual({
            success: true,
            status: PENDING_STATUS,
            attemps: mockOtp.attempts,
            status_description: 'El código está pendiente de verificación.',
        });
    });

    test('sendSmsVerificatioCode debería manejar errores y retornar estado de error', async () => {
        (smsOtpRepository.createSmsVerificationCode as jest.Mock).mockRejectedValue(new Error('Error de envío'));

        const result = await sendSmsVerificatioCode('123456789');

        expect(smsOtpRepository.createSmsVerificationCode).toHaveBeenCalledWith('123456789');
        expect(result).toEqual({
            success: false,
            status: 'error',
            status_description: 'Algo ha fallado, ¡intenta más tarde!.',
        });
    });


    test('checkSmsVerificationCode debería verificar correctamente el código', async () => {
        (smsOtpRepository.validateSmsVerificationCode as jest.Mock).mockResolvedValue(APPROVED_STATUS);

        const result = await checkSmsVerificationCode('123456', '123456789');

        expect(smsOtpRepository.validateSmsVerificationCode).toHaveBeenCalledWith('123456', '123456789');
        expect(result).toEqual({
            success: true,
            status: APPROVED_STATUS,
            status_description: 'El código se verificó correctamente.',
        });
    });

    test('checkSmsVerificationCode debería manejar códigos incorrectos', async () => {
        const invalidStatus = 'failed';
        (smsOtpRepository.validateSmsVerificationCode as jest.Mock).mockResolvedValue(invalidStatus);

        const result = await checkSmsVerificationCode('wrong_code', '123456789');

        expect(smsOtpRepository.validateSmsVerificationCode).toHaveBeenCalledWith('wrong_code', '123456789');
        expect(result).toEqual({
            success: false,
            status: invalidStatus,
            status_description: 'Algo ha fallado, ¡intenta más tarde!',
        });
    });

    test('checkSmsVerificationCode debería manejar excepciones y retornar estado de error', async () => {
        (smsOtpRepository.validateSmsVerificationCode as jest.Mock).mockRejectedValue(new Error('Error de validación'));

        const result = await checkSmsVerificationCode('123456', '123456789');

        expect(smsOtpRepository.validateSmsVerificationCode).toHaveBeenCalledWith('123456', '123456789');
        expect(result).toEqual({
            success: false,
            status: 'error',
            status_description: 'Algo ha fallado, ¡intenta más tarde!.',
        });
    });

    test('sendEmailVerificatioCoden debería enviar un código de verificación exitosamente', async () => {
        const mockOtp = { status: PENDING_STATUS, attempts: 1 };
        (emailOtpRepository.createEmailVerificationCode as jest.Mock).mockResolvedValue(mockOtp);

        const result = await sendEmailVerificatioCoden('test@example.com');

        expect(emailOtpRepository.createEmailVerificationCode).toHaveBeenCalledWith('test@example.com');
        expect(result).toEqual({
            success: true,
            status: PENDING_STATUS,
            attemps: mockOtp.attempts,
            status_description: 'El código está pendiente de verificación.',
        });
    });

    test('sendEmailVerificatioCoden debería manejar errores y retornar estado de error', async () => {
        (emailOtpRepository.createEmailVerificationCode as jest.Mock).mockRejectedValue(new Error('Error de envío'));

        const result = await sendEmailVerificatioCoden('test@example.com');

        expect(emailOtpRepository.createEmailVerificationCode).toHaveBeenCalledWith('test@example.com');
        expect(result).toEqual({
            success: false,
            status: 'error',
            status_description: 'Algo ha fallado, ¡intenta más tarde!.',
        });
    });

    test('checkEmailVerificationCode debería verificar correctamente el código', async () => {
        (emailOtpRepository.validateEmailVerificationCode as jest.Mock).mockResolvedValue(APPROVED_STATUS);

        const result = await checkEmailVerificationCode('123456', 'test@example.com');

        expect(emailOtpRepository.validateEmailVerificationCode).toHaveBeenCalledWith('123456', 'test@example.com');
        expect(result).toEqual({
            success: true,
            status: APPROVED_STATUS,
            status_description: 'El código se verificó correctamente.',
        });
    });

    test('checkEmailVerificationCode debería manejar códigos incorrectos', async () => {
        const invalidStatus = 'failed';
        (emailOtpRepository.validateEmailVerificationCode as jest.Mock).mockResolvedValue(invalidStatus);

        const result = await checkEmailVerificationCode('wrong_code', 'test@example.com');

        expect(emailOtpRepository.validateEmailVerificationCode).toHaveBeenCalledWith('wrong_code', 'test@example.com');
        expect(result).toEqual({
            success: false,
            status: invalidStatus,
            status_description: 'Algo ha fallado, ¡intenta más tarde!',
        });
    });

    test('checkEmailVerificationCode debería manejar excepciones y retornar estado de error', async () => {
        (emailOtpRepository.validateEmailVerificationCode as jest.Mock).mockRejectedValue(new Error('Error de validación'));

        const result = await checkEmailVerificationCode('123456', 'test@example.com');

        expect(emailOtpRepository.validateEmailVerificationCode).toHaveBeenCalledWith('123456', 'test@example.com');
        expect(result).toEqual({
            success: false,
            status: 'error',
            status_description: 'Algo ha fallado, ¡intenta más tarde!.',
        });
    });

});