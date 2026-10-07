import {
    findLastCoursePendingPurchase,
    findUserPurchaseById,
    findUserPurchaseByReference,
    storeCoursePaymentTransaction,
    updatePurchaseById,
} from '@/repository/payments';
import { prisma } from '@/lib/prisma';
import type { PaymentPurchasePatch } from '@/application/payments/payment.records';

jest.mock('@/lib/prisma', () => ({ prisma: { $transaction: jest.fn(), purchase: { update: jest.fn(), findFirst: jest.fn() } } }));

describe('payment repository records', () => {
    beforeEach(() => jest.clearAllMocks());

    it('creates a pending purchase from an immutable command without mutating it', async () => {
        const tx = {
            cart: { create: jest.fn().mockResolvedValue({ id: 4 }) },
            purchase: { create: jest.fn().mockResolvedValue({
                id: 5, cartId: 4, trxId: '', reference: 'ref', paymentMethod: '', trxCreationDate: new Date(),
                total: 0, subtotal: 0, status: 'PENDING', createdAt: new Date(), updatedAt: null,
            }) },
        };
        (prisma.$transaction as jest.Mock).mockImplementation((callback) => callback(tx));
        const command = { courseId: 2, userId: 'user-1', reference: 'ref', occurredAt: new Date() };

        await expect(storeCoursePaymentTransaction(command)).resolves.toMatchObject({ id: 5, cartId: 4, status: 'PENDING' });
        expect(command).toEqual(expect.objectContaining({ courseId: 2, userId: 'user-1' }));
    });

    it('uses the explicit payment patch and normalizes every missing singular read to null', async () => {
        const patch: PaymentPurchasePatch = { trxId: 'trx', reference: 'ref', paymentMethod: 'CARD', trxCreationDate: new Date(), status: 'APPROVED' };
        (prisma.purchase.update as jest.Mock).mockResolvedValue({
            id: 5, cartId: 4, ...patch, total: 0, subtotal: 0, createdAt: new Date(), updatedAt: null,
        });
        (prisma.purchase.findFirst as jest.Mock).mockResolvedValue(null);

        await expect(updatePurchaseById(5, patch)).resolves.toMatchObject({ trxId: 'trx', status: 'APPROVED' });
        await expect(findLastCoursePendingPurchase(2, 'user-1')).resolves.toBeNull();
        await expect(findUserPurchaseById(5, 'user-1')).resolves.toBeNull();
        await expect(findUserPurchaseByReference('missing-reference')).resolves.toBeNull();
        expect(prisma.purchase.update).toHaveBeenCalledWith({ where: { id: 5 }, data: patch });
    });
});
