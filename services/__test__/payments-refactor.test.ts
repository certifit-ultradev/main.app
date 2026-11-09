import {
    createCoursePaymentTransaction,
    quoteCoursePaymentTransaction,
    updateCoursePaymentTransaction,
} from '@/services/payments';
import { getAuthenticatedActor as getAuthenticatedUser } from '@/infrastructure/auth/authenticated-actor';
import { getServerEnv } from '@/config/env';
import { prismaPaymentCourseReadPort } from '@/repository/payment-course-read.prisma';
import { findLastCoursePendingPurchase, findUserPurchaseById, findUserPurchaseByReference, updatePurchaseById } from '@/repository/payments';
import { fetchTransaction } from '@/services/wompi';
import { assignCourse } from '@/repository/users';
import { PaymentProviderError } from '@/exceptions/payment-provider-error';

jest.mock('@/infrastructure/auth/authenticated-actor', () => ({ getAuthenticatedActor: jest.fn() }));
jest.mock('@/config/env', () => ({ getServerEnv: jest.fn() }));
jest.mock('@/repository/payment-course-read.prisma', () => ({
    prismaPaymentCourseReadPort: { findCourseForQuote: jest.fn(), hasEnrollment: jest.fn() },
}));
jest.mock('@/repository/payments', () => ({ findLastCoursePendingPurchase: jest.fn(), findUserPurchaseById: jest.fn(), findUserPurchaseByReference: jest.fn(), storeCoursePaymentTransaction: jest.fn(), updatePurchaseById: jest.fn() }));
jest.mock('@/services/wompi', () => ({ fetchTransaction: jest.fn() }));
jest.mock('@/repository/users', () => ({ assignCourse: jest.fn(), removeCourseFromUser: jest.fn() }));
jest.mock('@/infrastructure/payments/payment-redirect-url', () => ({ getPaymentReviewUrl: jest.fn(() => 'https://app.example.com/payment-review') }));
jest.mock('@/infrastructure/payments/wompi-integrity', () => ({ createWompiCheckoutIntegrity: jest.fn(async () => 'signature') }));
jest.mock('@/utils/service-wrapper', () => ({ executeService: (operation: () => unknown) => operation() }));

describe('payments refactor', () => {
    const user = { id: 'user-1', email: 'user@example.com', emailVerified: new Date(), isAdmin: false };

    beforeEach(() => {
        jest.clearAllMocks();
        (getAuthenticatedUser as jest.Mock).mockResolvedValue(user);
        (getServerEnv as jest.Mock).mockReturnValue({ WOMPI_PUB_KEY: 'pub', WOMPI_SIG_DATA: 'sig' });
    });

    it('requires a verified user before quoting a payment', async () => {
        (getAuthenticatedUser as jest.Mock).mockRejectedValue(new Error('El usuario debe verificar su email'));
        await expect(quoteCoursePaymentTransaction({ canonicalId: 'course-1' })).rejects.toThrow('El usuario debe verificar su email');
        expect(prismaPaymentCourseReadPort.findCourseForQuote).not.toHaveBeenCalled();
    });

    it('quotes a course using the authenticated user and validated Wompi keys', async () => {
        (prismaPaymentCourseReadPort.findCourseForQuote as jest.Mock).mockResolvedValue({ id: 1, canonicalId: 'course-1', isActive: true, expiresAt: new Date(Date.now() + 60_000), price: 100 });
        (prismaPaymentCourseReadPort.hasEnrollment as jest.Mock).mockResolvedValue(false);
        (findLastCoursePendingPurchase as jest.Mock).mockResolvedValue({ id: 7, reference: 'ref-1' });

        await expect(quoteCoursePaymentTransaction({ canonicalId: 'course-1' })).resolves.toMatchObject({ purchaseId: 7, publicKey: 'pub', amountInCents: 10_000 });
        expect(findLastCoursePendingPurchase).toHaveBeenCalledWith(1, user.id);
    });

    it('creates a transaction and keeps webhook updates independent from session auth', async () => {
        const createdAt = new Date('2025-01-15T00:00:00.000Z');
        (findUserPurchaseById as jest.Mock).mockResolvedValue({ status: 'PENDING', cart: { courseId: 2 } });
        (fetchTransaction as jest.Mock).mockResolvedValue({ id: 'trx-1', reference: 'ref', paymentMethodType: 'CARD', createdAt, status: 'APPROVED' });
        (updatePurchaseById as jest.Mock).mockResolvedValue({ id: 1 });
        (assignCourse as jest.Mock).mockResolvedValue({ id: 1 });
        await expect(createCoursePaymentTransaction({ purchaseId: 1, transactionId: 'trx-1' })).resolves.toMatchObject({ success: true });
        expect(updatePurchaseById).toHaveBeenCalledWith(1, {
            trxId: 'trx-1', reference: 'ref', paymentMethod: 'CARD', trxCreationDate: createdAt, status: 'APPROVED',
        });
        expect(assignCourse).toHaveBeenCalledWith(user.id, 2);

        (findUserPurchaseByReference as jest.Mock).mockResolvedValue({ id: 1, cart: { userId: user.id, courseId: 2 } });
        (updatePurchaseById as jest.Mock).mockResolvedValue({ id: 1 });
        await expect(updateCoursePaymentTransaction({ transactionId: 'trx-2', reference: 'ref', paymentMethod: 'CARD', occurredAt: new Date(), status: 'DECLINED' })).resolves.toEqual({ outcome: 'applied' });
        expect(getAuthenticatedUser).toHaveBeenCalledTimes(1);
    });

    it('does not mutate or enroll again when a terminal webhook event is replayed', async () => {
        (findUserPurchaseByReference as jest.Mock).mockResolvedValue({
            id: 1,
            trxId: 'trx-1',
            status: 'APPROVED',
            cart: { userId: user.id, courseId: 2 },
        });

        await expect(updateCoursePaymentTransaction({
            transactionId: 'trx-1', reference: 'ref', paymentMethod: 'CARD',
            occurredAt: new Date(), status: 'APPROVED',
        })).resolves.toEqual({ outcome: 'already_applied' });

        expect(updatePurchaseById).not.toHaveBeenCalled();
        expect(assignCourse).not.toHaveBeenCalled();
    });

    it('applies an approved webhook transition and enrolls the purchase owner', async () => {
        (findUserPurchaseByReference as jest.Mock).mockResolvedValue({
            id: 1,
            trxId: '',
            status: 'PENDING',
            cart: { userId: user.id, courseId: 2 },
        });
        (updatePurchaseById as jest.Mock).mockResolvedValue({ id: 1 });
        (assignCourse as jest.Mock).mockResolvedValue({ id: 1 });

        await expect(updateCoursePaymentTransaction({
            transactionId: 'trx-1', reference: 'ref', paymentMethod: 'CARD',
            occurredAt: new Date(), status: 'APPROVED',
        })).resolves.toEqual({ outcome: 'applied' });

        expect(updatePurchaseById).toHaveBeenCalledWith(1, expect.objectContaining({ status: 'APPROVED' }));
        expect(assignCourse).toHaveBeenCalledWith(user.id, 2);
    });

    it('fails without acknowledging or enrolling when the purchase is missing', async () => {
        (findUserPurchaseByReference as jest.Mock).mockResolvedValue(null);

        await expect(updateCoursePaymentTransaction({
            transactionId: 'trx-1', reference: 'unknown', paymentMethod: 'CARD',
            occurredAt: new Date(), status: 'APPROVED',
        })).rejects.toMatchObject({ name: 'NotFoundError', cause: 'La compra no existe' });

        expect(updatePurchaseById).not.toHaveBeenCalled();
        expect(assignCourse).not.toHaveBeenCalled();
    });

    it('does not enroll when persisting the webhook event fails', async () => {
        (findUserPurchaseByReference as jest.Mock).mockResolvedValue({
            id: 1, trxId: '', status: 'PENDING', cart: { userId: user.id, courseId: 2 },
        });
        (updatePurchaseById as jest.Mock).mockRejectedValue(new Error('storage unavailable'));

        await expect(updateCoursePaymentTransaction({
            transactionId: 'trx-1', reference: 'ref', paymentMethod: 'CARD',
            occurredAt: new Date(), status: 'APPROVED',
        })).rejects.toThrow('storage unavailable');

        expect(assignCourse).not.toHaveBeenCalled();
    });

    it('rejects an unknown provider status before persisting it', async () => {
        (findUserPurchaseById as jest.Mock).mockResolvedValue({ status: 'PENDING', cart: { courseId: 2 } });
        (fetchTransaction as jest.Mock).mockResolvedValue({ id: 'trx-1', reference: 'ref', paymentMethodType: 'CARD', createdAt: new Date(), status: 'UNKNOWN' });

        await expect(createCoursePaymentTransaction({ purchaseId: 1, transactionId: 'trx-1' }))
            .rejects.toMatchObject({ name: 'PaymentProviderError', kind: 'invalid_response' });
        expect(updatePurchaseById).not.toHaveBeenCalled();
        expect(assignCourse).not.toHaveBeenCalled();
    });

    it('does not persist a transaction when the provider response is malformed', async () => {
        (findUserPurchaseById as jest.Mock).mockResolvedValue({ status: 'PENDING', cart: { courseId: 2 } });
        (fetchTransaction as jest.Mock).mockRejectedValue(new PaymentProviderError('invalid_response'));

        await expect(createCoursePaymentTransaction({ purchaseId: 1, transactionId: 'trx-invalid' }))
            .rejects.toMatchObject({ name: 'PaymentProviderError', kind: 'invalid_response' });
        expect(updatePurchaseById).not.toHaveBeenCalled();
        expect(assignCourse).not.toHaveBeenCalled();
    });

    it('keeps provider absence distinct from a purchase conflict', async () => {
        (findUserPurchaseById as jest.Mock).mockResolvedValue({ status: 'PENDING', cart: { courseId: 2 } });
        (fetchTransaction as jest.Mock).mockRejectedValue(new PaymentProviderError('transaction_not_found'));

        await expect(createCoursePaymentTransaction({ purchaseId: 1, transactionId: 'trx-missing' }))
            .rejects.toMatchObject({ name: 'PaymentProviderError', kind: 'transaction_not_found' });
        expect(updatePurchaseById).not.toHaveBeenCalled();
        expect(assignCourse).not.toHaveBeenCalled();
    });

    it('keeps an already approved purchase as a business conflict without calling Wompi', async () => {
        (findUserPurchaseById as jest.Mock).mockResolvedValue({ status: 'APPROVED', updatedAt: null });

        await expect(createCoursePaymentTransaction({ purchaseId: 1, transactionId: 'trx-1' }))
            .rejects.toMatchObject({ name: 'TransactionError' });
        expect(fetchTransaction).not.toHaveBeenCalled();
        expect(updatePurchaseById).not.toHaveBeenCalled();
    });

    it.each(['PENDING', 'DECLINED', 'VOIDED', 'ERROR'] as const)(
        'persists %s without assigning a course', async (status) => {
            const createdAt = new Date('2025-01-15T00:00:00.000Z');
            (findUserPurchaseById as jest.Mock).mockResolvedValue({ status: 'PENDING', cart: { courseId: 2 } });
            (fetchTransaction as jest.Mock).mockResolvedValue({
                id: 'trx-1', reference: 'ref', paymentMethodType: 'PSE', createdAt, status,
            });
            (updatePurchaseById as jest.Mock).mockResolvedValue({ id: 1 });

            await expect(createCoursePaymentTransaction({ purchaseId: 1, transactionId: 'trx-1' }))
                .resolves.toMatchObject({ success: true });
            expect(updatePurchaseById).toHaveBeenCalledWith(1, {
                trxId: 'trx-1', reference: 'ref', paymentMethod: 'PSE', trxCreationDate: createdAt, status,
            });
            expect(assignCourse).not.toHaveBeenCalled();
        },
    );
});
