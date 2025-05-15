import { Purchase } from "@/models/purchase";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/exceptions/not-found";

/**
 * 
 * @param courseId 
 * @param userId 
 * @param purchase 
 * @returns 
 */
export const storeCoursePaymentTransaction = async (courseId: number, userId: string, purchase: Purchase): Promise<Purchase | null> => {
    const txPurchase = await prisma.$transaction(async (tx) => {
        const cartCreated = await tx.cart.create({
            data: {
                userId,
                courseId,
            }
        });
        purchase.cartId = cartCreated.id;
        const purchaseCreated = await tx.purchase.create({
            data: {
                cartId: cartCreated.id,
                trxId: purchase.trxId,
                reference: purchase.reference,
                paymentMethod: purchase.paymentMethod,
                trxCreationDate: purchase.trxCreationDate,
                total: purchase.total,
                subtotal: purchase.subtotal,
                status: purchase.status
            }
        });

        return purchaseCreated;
    })

    return new Purchase({
        cartId: txPurchase.cartId,
        trxId: txPurchase.trxId,
        reference: txPurchase.reference,
        paymentMethod: txPurchase.paymentMethod,
        trxCreationDate: txPurchase.trxCreationDate,
        total: txPurchase.total,
        subtotal: txPurchase.subtotal,
        status: txPurchase.status,
        createdAt: txPurchase.createdAt,
        updatedAt: txPurchase.updatedAt
    });
}

/**
 * 
 * @param id 
 * @param data 
 * @returns 
 */
export const updatePurchaseById = async (id: number, data: Partial<Purchase>) => {
    const { id: _, cartId: __, cart, ...updateData } = data;
    return await prisma.purchase.update({
        where: { id },
        data: updateData
    });
}

/**
 * 
 * @param id 
 * @param userId 
 * @returns 
 */
export const findUserPurchaseById = async (id: number, userId: string): Promise<Purchase> => {
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

    if (!purchase) {
        throw new NotFoundError('Compra no encontrada');
    }

    return new Purchase({
        ...purchase
    });
}

/**
 * 
 * @param reference 
 * @returns 
 */
export const findUserPurchaseByReference = async (reference: string): Promise<Purchase> => {
    const purchase = await prisma.purchase.findFirst({
        relationLoadStrategy: 'join',
        include: {
            cart: true
        },
        where: {
            reference
        }
    });

    if (!purchase) {
        throw new NotFoundError('Compra no encontrada');
    }

    return new Purchase({
        ...purchase
    });
}

/**
 * 
 * @param courseId 
 * @param userId 
 * @returns 
 */
export const findLastCoursePendingPurchase = async (courseId: number, userId: string): Promise<Purchase | null> => {
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

    if (!lastPurchase) {
        throw new NotFoundError('Compra no encontrada');
    }

    return new Purchase({
        ...lastPurchase
    });
}