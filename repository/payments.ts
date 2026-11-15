import { prisma } from "@/lib/prisma";
import type { CreatePendingCoursePurchaseCommand, PaymentPurchasePatch, PurchaseRecord } from '@/application/payments/payment.records';

const toPurchaseRecord = (purchase: {
    id: number; cartId: number; trxId: string; reference: string; paymentMethod: string; trxCreationDate: Date;
    total: number; subtotal: number; status: PurchaseRecord['status']; createdAt: Date; updatedAt: Date | null;
    cart?: { userId: string; courseId: number } | null;
}): PurchaseRecord => ({
    id: purchase.id, cartId: purchase.cartId, trxId: purchase.trxId, reference: purchase.reference,
    paymentMethod: purchase.paymentMethod, trxCreationDate: purchase.trxCreationDate, total: purchase.total,
    subtotal: purchase.subtotal, status: purchase.status, createdAt: purchase.createdAt, updatedAt: purchase.updatedAt,
    ...(purchase.cart ? { cart: { userId: purchase.cart.userId, courseId: purchase.cart.courseId } } : {}),
});

/**
 * 
 * @param courseId 
 * @param userId 
 * @param purchase 
 * @returns 
 */
export const storeCoursePaymentTransaction = async (command: CreatePendingCoursePurchaseCommand): Promise<PurchaseRecord> => {
    const txPurchase = await prisma.$transaction(async (tx) => {
        const cartCreated = await tx.cart.create({
            data: {
                userId: command.userId,
                courseId: command.courseId,
            }
        });
        const purchaseCreated = await tx.purchase.create({
            data: {
                cartId: cartCreated.id,
                trxId: '', reference: command.reference, paymentMethod: '', trxCreationDate: command.occurredAt,
                total: 0, subtotal: 0, status: 'PENDING',
            }
        });

        return purchaseCreated;
    })

    return toPurchaseRecord(txPurchase);
}

/**
 * 
 * @param id 
 * @param data 
 * @returns 
 */
export const updatePurchaseById = async (id: number, data: PaymentPurchasePatch): Promise<PurchaseRecord> => {
    const updated = await prisma.purchase.update({
        where: { id },
        data
    });
    return toPurchaseRecord(updated);
}

/**
 * 
 * @param id 
 * @param userId 
 * @returns 
 */
export const findUserPurchaseById = async (id: number, userId: string): Promise<PurchaseRecord | null> => {
    const purchase = await prisma.purchase.findFirst({
        relationLoadStrategy: 'join',
        include: {
            cart: true
        },
        where: {
            id,
            cart: {
                userId
            }
        }
    });

    return purchase ? toPurchaseRecord(purchase) : null;
}

/**
 * 
 * @param reference 
 * @returns 
 */
export const findUserPurchaseByReference = async (reference: string): Promise<PurchaseRecord | null> => {
    const purchase = await prisma.purchase.findFirst({
        relationLoadStrategy: 'join',
        include: {
            cart: true
        },
        where: {
            reference
        }
    });

    return purchase ? toPurchaseRecord(purchase) : null;
}

/**
 * 
 * @param courseId 
 * @param userId 
 * @returns 
 */
export const findLastCoursePendingPurchase = async (courseId: number, userId: string): Promise<PurchaseRecord | null> => {
    const lastPurchase = await prisma.purchase.findFirst({
        relationLoadStrategy: 'join',
        where: {
            status: "PENDING",
            cart: {
                userId,
                courseId
            }
        }
    });

    return lastPurchase ? toPurchaseRecord(lastPurchase) : null;
}
