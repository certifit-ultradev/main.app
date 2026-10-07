/**
 * Serializable result returned from a server action.
 *
 * `ok` is deliberately required so consumers can narrow safely without
 * guessing from optional `message`, `error`, or `payload` fields.
 */
export type ActionErrorCode =
    | 'VALIDATION'
    | 'UNAUTHENTICATED'
    | 'FORBIDDEN'
    | 'EMAIL_UNVERIFIED'
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'UNEXPECTED';

export type ActionSuccess<T> = {
    ok: true;
    data: T;
    message?: string;
};

export type ActionFailure = {
    ok: false;
    error: {
        code: ActionErrorCode;
        message: string;
        fieldErrors?: Record<string, string[]>;
    };
};

export type ActionResult<T> = ActionSuccess<T> | ActionFailure;

export function actionSuccess<T>(data: T, message?: string): ActionSuccess<T> {
    return { ok: true, data, ...(message ? { message } : {}) };
}

export function actionFailure(
    code: ActionFailure['error']['code'],
    message: string,
    fieldErrors?: Record<string, string[]>,
): ActionFailure {
    return {
        ok: false,
        error: { code, message, ...(fieldErrors ? { fieldErrors } : {}) },
    };
}
