import { z } from 'zod';
import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { MalformedJsonError } from '@/exceptions/malformed-json';
import { CourseAlreadyPurchasedError } from '@/exceptions/course-already-purchased';
import { CourseInvalidStateError } from '@/exceptions/course-invalid-state';
import { CourseNotPurchasedError } from '@/exceptions/course-not-purchased';
import { NotFoundError } from '@/exceptions/not-found';
import { TransactionError } from '@/exceptions/transaction-error';
import { PaymentProviderError } from '@/exceptions/payment-provider-error';
import { UserExistError } from '@/exceptions/user-exist';
import { UserNotLoggedError } from '@/exceptions/user-not-logged';
import { EmailUnverifiedError, InsufficientRoleError } from '@/exceptions/actor-access-errors';
import { safeLogger } from '@/shared/observability/safe-logger';

jest.mock('@/shared/observability/safe-logger', () => ({ safeLogger: { error: jest.fn() } }));

const privateDetail = 'private@example.com';
const invalidInput = z.object({ id: z.number().int().positive() }).safeParse({ id: 'private' });
if (invalidInput.success) throw new Error('Expected invalid input for the validation test');

describe('HTTP error encoder', () => {
    beforeEach(() => jest.clearAllMocks());

    it.each([
        ['malformed JSON', new MalformedJsonError(), 400, 'BAD_REQUEST'],
        ['JSON SyntaxError', new SyntaxError(privateDetail), 400, 'BAD_REQUEST'],
        ['already purchased', new CourseAlreadyPurchasedError(privateDetail), 409, 'CONFLICT'],
        ['invalid course state', new CourseInvalidStateError(privateDetail), 409, 'CONFLICT'],
        ['transaction conflict', new TransactionError(privateDetail), 409, 'CONFLICT'],
        ['provider transaction absent', new PaymentProviderError('transaction_not_found'), 404, 'NOT_FOUND'],
        ['provider HTTP failure', new PaymentProviderError('upstream_error'), 502, 'BAD_GATEWAY'],
        ['provider payload invalid', new PaymentProviderError('invalid_response'), 502, 'BAD_GATEWAY'],
        ['provider transport unavailable', new PaymentProviderError('unavailable'), 503, 'SERVICE_UNAVAILABLE'],
        ['unauthenticated', new UserNotLoggedError(privateDetail), 401, 'UNAUTHENTICATED'],
        ['email unverified', new EmailUnverifiedError(), 403, 'EMAIL_UNVERIFIED'],
        ['insufficient role', new InsufficientRoleError(), 403, 'FORBIDDEN'],
        ['not enrolled', new CourseNotPurchasedError(privateDetail), 403, 'FORBIDDEN'],
        ['duplicate user', new UserExistError(privateDetail), 409, 'CONFLICT'],
        ['not found', new NotFoundError(privateDetail), 404, 'NOT_FOUND'],
        ['invalid input', invalidInput.error, 422, 'VALIDATION'],
    ] as const)('maps %s to a public error without private details', async (_label, error, status, code) => {
        const response = mapErrorToAPIResponse(error);
        const body = await response.json();

        expect(response.status).toBe(status);
        expect(body).toEqual({ error: { code, message: expect.any(String) } });
        expect(JSON.stringify(body)).not.toContain(privateDetail);
        expect(body).not.toHaveProperty('success');
        expect(body).not.toHaveProperty('data');
    });

    it('maps unexpected errors to a generic 500 and logs only safe metadata', async () => {
        const response = mapErrorToAPIResponse(new Error(privateDetail));
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({ error: { code: 'UNEXPECTED', message: 'Ocurrió un error. Inténtalo más tarde.' } });
        expect(JSON.stringify(body)).not.toContain(privateDetail);
        expect(safeLogger.error).toHaveBeenCalledWith('http.error.unexpected', { name: 'Error' });
    });
});
