import { Purchase } from "@/models/purchase";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/exceptions/not-found";

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
            data: purchase
        });

        return purchaseCreated;
    })

    return new Purchase({
        ...txPurchase
    });
}

export const updatePurchaseById = async (id: number, data: Partial<Purchase>) => {
    return await prisma.purchase.update({
        where: { id },
        data
    });
}

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