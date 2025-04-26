import { checkSmsVerificationCode, sendSmsVerificatioCode } from "@/services/verification-otp";
import { OtpCreationResult, OtpValidationResult, ServerActionResponse } from "@/utils/types";
import { checkOtp, sendOtp } from "../otp";

jest.mock('@/services/verification-otp');

const mockPhoneNumber = '+571234567890';

describe('Send Otp Action Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Debería enviar un mensaje otp exitosamente', async () => {
        const otpResult: OtpCreationResult = {
            success: true,
            status: "pending",
            status_description: "",
            attemps: 1
        };
        (sendSmsVerificatioCode as jest.Mock).mockResolvedValue(otpResult);

        const result = await sendOtp(mockPhoneNumber);

        expect(sendSmsVerificatioCode).toHaveBeenCalledWith(mockPhoneNumber);

        expect({
            success: true,
            message: 'Se ha enviado correctamente el código de validación.',
        }).toEqual(result);
    });

    test('Debería devolver un mensaje otp no enviado', async () => {
        const otpResult: OtpCreationResult = {
            success: false,
            status: "max_attempts_reached",
            status_description: "Ha alcanzado la cantidad límite de códigos.",
            attemps: 1
        };
        (sendSmsVerificatioCode as jest.Mock).mockResolvedValue(otpResult);

        const result = await sendOtp(mockPhoneNumber);

        expect(sendSmsVerificatioCode).toHaveBeenCalledWith(mockPhoneNumber);

        expect({
            success: false,
            error: otpResult.status_description,
        }).toEqual(result);
    });
});

describe('Check Otp Action Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Debería checkear el código otp exitosamente', async () => {
        const otpResultValidation: OtpValidationResult = {
            success: true,
            status: "approved",
            status_description: "El código se verificó correctamente."
        };
        (checkSmsVerificationCode as jest.Mock).mockResolvedValue(otpResultValidation);

        const result = await checkOtp(mockPhoneNumber, "1234");

        expect(checkSmsVerificationCode).toHaveBeenCalledWith(mockPhoneNumber, "1234");

        expect({
            success: true,
            message: 'Se ha validado correctamente el código.',
        }).toEqual(result);
    });

    test('Debería devolver un mensaje otp invalido', async () => {
        const otpResultValidation: OtpValidationResult = {
            success: false,
            status: "failed",
            status_description: "Fallo la validación, código incorrecto."
        };
        (checkSmsVerificationCode as jest.Mock).mockResolvedValue(otpResultValidation);

        const result = await checkOtp(mockPhoneNumber, "1234");

        expect(checkSmsVerificationCode).toHaveBeenCalledWith(mockPhoneNumber, "1234");

        expect({
            success: false,
            error: otpResultValidation.status_description,
        }).toEqual(result);
    });
});