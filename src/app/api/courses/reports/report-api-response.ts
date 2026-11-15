import { UserNotLoggedError } from '@/exceptions/user-not-logged';
import { EmailUnverifiedError, InsufficientRoleError } from '@/exceptions/actor-access-errors';
import { apiFailure, apiSuccess, type ApiResponse } from '@/interfaces/http/api-response';

export const reportSuccessResponse = <T>(data: T): Response => Response.json(apiSuccess(data));

/** Reports are authenticated endpoints; no infrastructure error escapes their public contract. */
export const reportFailureResponse = (error: unknown): Response => {
    if (error instanceof UserNotLoggedError) {
        return Response.json(apiFailure('UNAUTHENTICATED', 'Debes iniciar sesión para consultar los reportes.'), { status: 401 });
    }
    if (error instanceof EmailUnverifiedError) {
        return Response.json(apiFailure('EMAIL_UNVERIFIED', 'Debes verificar tu correo para consultar los reportes.'), { status: 403 });
    }
    if (error instanceof InsufficientRoleError) {
        return Response.json(apiFailure('FORBIDDEN', 'No tienes permisos para consultar los reportes.'), { status: 403 });
    }

    return Response.json(apiFailure('UNEXPECTED', 'No fue posible consultar los reportes.'), { status: 500 });
};

export type ReportApiResponse<T> = ApiResponse<T>;
