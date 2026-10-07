import {
    apiFailure,
    apiSuccess,
    isApiSuccess,
    type ApiErrorCode,
    type ApiResponse,
} from '@/interfaces/http/api-response';
import {
    actionFailure,
    actionSuccess,
    type ActionResult,
} from '@/interfaces/actions/action-result';

describe('boundary contracts', () => {
    it('creates HTTP responses with exactly one public shape', () => {
        const success: ApiResponse<{ id: number }> = apiSuccess({ id: 1 });
        const failure: ApiResponse<{ id: number }> = apiFailure('VALIDATION', 'Datos inválidos', {
            title: ['El título es obligatorio'],
        });

        expect(isApiSuccess(success)).toBe(true);
        expect(success).toEqual({ data: { id: 1 } });
        expect(isApiSuccess(failure)).toBe(false);
        expect(failure).toEqual({
            error: {
                code: 'VALIDATION',
                message: 'Datos inválidos',
                fieldErrors: { title: ['El título es obligatorio'] },
            },
        });
        expect(success).not.toHaveProperty('error');
        expect(failure).not.toHaveProperty('data');
    });

    it('keeps HTTP error codes and response variants closed at compile time', () => {
        const acceptsUnknownCode: 'INTERNAL_ONLY' extends ApiErrorCode ? true : false = false;
        const acceptsBothVariants: {
            data: { id: number };
            error: { code: 'VALIDATION'; message: string };
        } extends ApiResponse<{ id: number }> ? true : false = false;

        expect(acceptsUnknownCode).toBe(false);
        expect(acceptsBothVariants).toBe(false);
    });

    it('creates discriminated server action results', () => {
        const success: ActionResult<void> = actionSuccess(undefined, 'Guardado');
        const failure: ActionResult<void> = actionFailure('FORBIDDEN', 'No autorizado');

        if (success.ok) {
            expect(success.data).toBeUndefined();
            expect(success.message).toBe('Guardado');
        }

        if (!failure.ok) {
            expect(failure.error).toEqual({ code: 'FORBIDDEN', message: 'No autorizado' });
        }
    });
});
