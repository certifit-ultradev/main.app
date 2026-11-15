/**
 * Public, serializable contract for successful HTTP endpoints.
 */
export type ApiSuccess<T> = {
    data: T;
    error?: never;
};

/**
 * Closed public error codes. Add a code only alongside a documented HTTP mapping.
 */
export const API_ERROR_CODES = [
    'BAD_REQUEST',
    'UNAUTHENTICATED',
    'EMAIL_UNVERIFIED',
    'FORBIDDEN',
    'NOT_FOUND',
    'CONFLICT',
    'BAD_GATEWAY',
    'SERVICE_UNAVAILABLE',
    'VALIDATION',
    'UNEXPECTED',
] as const;

export type ApiErrorCode = typeof API_ERROR_CODES[number];

/**
 * Public, serializable contract for failed HTTP endpoints.
 */
export type ApiFailure = {
    data?: never;
    error: {
        code: ApiErrorCode;
        message: string;
        fieldErrors?: Record<string, string[]>;
    };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
    return 'data' in response;
}

export function apiSuccess<T>(data: T): ApiSuccess<T> {
    return { data };
}

export function apiFailure(
    code: ApiErrorCode,
    message: string,
    fieldErrors?: Record<string, string[]>,
): ApiFailure {
    return { error: { code, message, ...(fieldErrors ? { fieldErrors } : {}) } };
}
