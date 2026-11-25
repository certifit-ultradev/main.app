import { CourseAlreadyPurchasedError } from './course-already-purchased';
import { CourseInvalidStateError } from './course-invalid-state';
import { CourseNotPurchasedError } from './course-not-purchased';
import { NotFoundError } from './not-found';
import { UserExistError } from './user-exist';
import { UserNotLoggedError } from './user-not-logged';
import { EmailUnverifiedError, InsufficientRoleError } from './actor-access-errors';
import { PaymentProviderError } from './payment-provider-error';

/** Business rejections are useful diagnostics, but are not operational failures. */
export function isExpectedApplicationError(error: unknown): boolean {
    return error instanceof CourseAlreadyPurchasedError
        || error instanceof CourseInvalidStateError
        || error instanceof CourseNotPurchasedError
        || error instanceof NotFoundError
        || error instanceof UserExistError
        || error instanceof UserNotLoggedError
        || error instanceof EmailUnverifiedError
        || error instanceof InsufficientRoleError
        || (error instanceof PaymentProviderError && error.kind === 'transaction_not_found');
}
