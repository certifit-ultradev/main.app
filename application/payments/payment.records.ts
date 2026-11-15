/** Validated gateway transaction projection consumed by payment registration. */
export type PaymentTransactionRecord = Readonly<{
    id: string;
    reference: string;
    status: PaymentStatus;
    paymentMethodType: string;
    createdAt: Date;
}>;

/** Internal persistence record. Singular purchase reads use `PurchaseRecord | null`. */
export type PurchaseRecord = {
    id: number;
    cartId: number;
    trxId: string;
    reference: string;
    paymentMethod: string;
    trxCreationDate: Date;
    total: number;
    subtotal: number;
    status: string;
    createdAt: Date;
    updatedAt: Date | null;
    cart?: { userId: string; courseId: number };
};

export type CreatePendingCoursePurchaseCommand = Readonly<{
    courseId: number;
    userId: string;
    reference: string;
    occurredAt: Date;
}>;

export type PaymentPurchasePatch = Readonly<{
    trxId?: string;
    reference?: string;
    paymentMethod?: string;
    trxCreationDate?: Date;
    status?: PaymentStatus;
    total?: number;
    subtotal?: number;
}>;
import type { PaymentStatus } from './payment-events.commands';
