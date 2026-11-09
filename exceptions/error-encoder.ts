import { z } from "zod";
import { CourseAlreadyPurchasedError } from "./course-already-purchased";
import { CourseInvalidStateError } from "./course-invalid-state";
import { NotFoundError } from "./not-found";
import { TransactionError } from "./transaction-error";
import { PaymentProviderError } from './payment-provider-error';
import { UserNotLoggedError } from "./user-not-logged";
import { EmailUnverifiedError, InsufficientRoleError } from './actor-access-errors';
import { UserExistError } from "./user-exist";
import { Prisma } from "@/prisma/app/generated/prisma/client";
import { CourseNotPurchasedError } from "./course-not-purchased";
import { MalformedJsonError } from './malformed-json';
import { safeLogger } from '@/shared/observability/safe-logger';
import { apiFailure, type ApiErrorCode } from '@/interfaces/http/api-response';

const httpFailure = (status: number, code: ApiErrorCode, message: string): Response =>
    Response.json(apiFailure(code, message), { status });

/** Translates application failures at the HTTP boundary without exposing exception details. */
export function mapErrorToAPIResponse(error: unknown): Response {
    const isMalformedJson = error instanceof SyntaxError || (error instanceof Error && error.name === 'SyntaxError');

    switch (true) {
        case isMalformedJson || error instanceof MalformedJsonError:
            return httpFailure(400, 'BAD_REQUEST', 'El cuerpo de la solicitud no contiene JSON válido.');
        case error instanceof CourseAlreadyPurchasedError:
            return httpFailure(409, 'CONFLICT', 'El curso ya fue comprado.');
        case error instanceof CourseInvalidStateError:
            return httpFailure(409, 'CONFLICT', 'El curso no está disponible.');
        case error instanceof PaymentProviderError:
            if (error.kind === 'transaction_not_found') {
                return httpFailure(404, 'NOT_FOUND', 'Recurso no encontrado.');
            }
            if (error.kind === 'unavailable') {
                return httpFailure(503, 'SERVICE_UNAVAILABLE', 'No fue posible consultar la transacción. Inténtalo más tarde.');
            }
            return httpFailure(502, 'BAD_GATEWAY', 'No fue posible consultar la transacción. Inténtalo más tarde.');
        case error instanceof TransactionError:
            return httpFailure(409, 'CONFLICT', 'No fue posible procesar la transacción.');
        case error instanceof UserNotLoggedError:
            return httpFailure(401, 'UNAUTHENTICATED', 'No tienes una sesión válida para esta operación.');
        case error instanceof EmailUnverifiedError:
            return httpFailure(403, 'EMAIL_UNVERIFIED', 'Debes verificar tu correo para realizar esta operación.');
        case error instanceof InsufficientRoleError:
            return httpFailure(403, 'FORBIDDEN', 'No tienes permisos para esta operación.');
        case error instanceof CourseNotPurchasedError:
            return httpFailure(403, 'FORBIDDEN', 'No tienes acceso a este curso.');
        case error instanceof UserExistError:
            return httpFailure(409, 'CONFLICT', 'El recurso ya existe.');
        case error instanceof NotFoundError:
            return httpFailure(404, 'NOT_FOUND', 'Recurso no encontrado.');
        case error instanceof z.ZodError:
            return httpFailure(422, 'VALIDATION', 'Datos inválidos.');
        default:
            safeLogger.error('http.error.unexpected', {
                name: error instanceof Error ? error.name : 'unknown',
                ...(error instanceof Prisma.PrismaClientKnownRequestError ? { code: error.code } : {}),
            });
            return httpFailure(500, 'UNEXPECTED', 'Ocurrió un error. Inténtalo más tarde.');
    }
}

/**
 * logPrismaError
 * This function records a safe operational event without logging query data.
 * @param error - The error to log.
 */
export function logPrismaError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2028') {
            // Classify transaction failures without printing Prisma's raw metadata,
            // which may contain SQL or user-supplied values.
            const detail = error.meta?.error;
            const reason = typeof detail !== 'string' ? 'unknown'
                : /expired|timeout|timed out/i.test(detail) ? 'expired'
                    : /start/i.test(detail) ? 'start_failed'
                        : /closed/i.test(detail) ? 'closed' : 'other';
            safeLogger.error('persistence.known', { code: error.code, reason });
        } else safeLogger.error('persistence.known', { code: error.code });
    }
    else if (error instanceof Prisma.PrismaClientValidationError) safeLogger.error('persistence.validation');
    else if (error instanceof Prisma.PrismaClientInitializationError) safeLogger.error('persistence.initialization');
    else if (error instanceof Prisma.PrismaClientRustPanicError) safeLogger.error('persistence.panic');
    else if (error instanceof Error) safeLogger.error('persistence.unexpected', { name: error.name });
}
