import { v4 as uuidv4 } from "uuid";
import { createWompiCheckoutIntegrity } from '@/infrastructure/payments/wompi-integrity';
import { findLastCoursePendingPurchase, findUserPurchaseById, findUserPurchaseByReference, storeCoursePaymentTransaction, updatePurchaseById } from "@/repository/payments";
import { fetchTransaction } from "./wompi";
import { NotFoundError } from "@/exceptions/not-found";
import { CourseAlreadyPurchasedError } from "@/exceptions/course-already-purchased";
import type { ApplyPaymentEventCommand, PaymentStatus } from '@/application/payments/payment-events.commands';
import { isPaymentStatus } from '@/application/payments/payment-events.commands';
import type { QuoteCoursePaymentCommand, RegisterCoursePaymentTransactionCommand } from '@/application/payments/payment-commands';
import type { ApplyPaymentEventResult, CoursePaymentQuoteDto, CoursePaymentTransactionDto } from '@/application/payments/payment.dto';
import { assignCourse, removeCourseFromUser } from "@/repository/users";
import { getPaymentReviewUrl } from '@/infrastructure/payments/payment-redirect-url';
import { CourseInvalidStateError } from "@/exceptions/course-invalid-state";
import { TransactionError } from "@/exceptions/transaction-error";
import { executeService } from "@/utils/service-wrapper";
import { getAuthenticatedActor as getAuthenticatedUser } from '@/infrastructure/auth/authenticated-actor';
import { getServerEnv } from "@/config/env";
import { prismaPaymentCourseReadPort } from '@/repository/payment-course-read.prisma';
import type { PurchaseRecord } from '@/application/payments/payment.records';
import { PaymentProviderError } from '@/exceptions/payment-provider-error';

/**
 * 
 * @param courseCanonicalId 
 * @returns 
 */
const requirePersistentId = (id: number | undefined, entity: string): number => {
    if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
        throw new TransactionError(`${entity} no tiene un identificador válido.`);
    }
    return id;
};

const requireCartCourseId = (courseId: number | undefined): number => requirePersistentId(courseId, 'La compra');

const requireCartUserId = (userId: string | undefined): string => {
    if (!userId) throw new TransactionError('La compra no tiene un usuario válido.');
    return userId;
};

const requirePaymentStatus = (status: string): PaymentStatus => {
    if (!isPaymentStatus(status)) throw new PaymentProviderError('invalid_response');
    return status;
};

export const quoteCoursePaymentTransaction = async (command: QuoteCoursePaymentCommand): Promise<CoursePaymentQuoteDto> => {
    return executeService(async () => {
        const user = await getAuthenticatedUser();
        const { WOMPI_PUB_KEY: pubKey, WOMPI_SIG_DATA: sigData } = getServerEnv();

        const course = await prismaPaymentCourseReadPort.findCourseForQuote(command.canonicalId);
        if (course === null) {
            throw new NotFoundError("Curso no encontrado");
        }

        if (!course.isActive) {
            throw new CourseInvalidStateError("El curso no esta activo");
        }

        if (course.expiresAt < new Date()) {
            throw new CourseInvalidStateError("El curso ha expirado");
        }

        if (!Number.isFinite(course.price) || course.price <= 0) {
            throw new CourseInvalidStateError('El precio del curso no es válido');
        }

        if (await prismaPaymentCourseReadPort.hasEnrollment(course.id, user.id)) {
            throw new CourseAlreadyPurchasedError("Curso ya ha sido comprado.");
        }

        const courseId = requirePersistentId(course.id, 'El curso');
        let currentPurchase: PurchaseRecord | null = await findLastCoursePendingPurchase(courseId, user.id);
        if (!currentPurchase) {
            currentPurchase = await storeCoursePaymentTransaction({
                courseId, userId: user.id, reference: uuidv4(), occurredAt: new Date(),
            });
        }

        if (!currentPurchase) throw new TransactionError('No se pudo crear la compra');
        const purchaseId = requirePersistentId(currentPurchase.id, 'La compra');
        const reference = currentPurchase.reference;
        if (!reference) throw new TransactionError('La compra no tiene referencia.');
        const amountInCents = course.price * 100;

        return {
            purchaseId,
            currency: 'COP',
            amountInCents,
            reference,
            publicKey: pubKey,
            redirectUrl: getPaymentReviewUrl(),
            signature: { integrity: await createWompiCheckoutIntegrity(reference, amountInCents, sigData) },
            expirationTime: Date.now()
        };
    });
}

/**
 * 
 * @param purchaseId 
 * @param trxId 
 * @returns 
 */
export const createCoursePaymentTransaction = async (command: RegisterCoursePaymentTransactionCommand): Promise<CoursePaymentTransactionDto> => {
    return executeService(async () => {
        const user = await getAuthenticatedUser();

        const purchase = await findUserPurchaseById(command.purchaseId, user.id);
        if (!purchase) {
            throw new NotFoundError("La compra no existe");
        }

        const lastUpdate = purchase.updatedAt;
        if (lastUpdate && (new Date().getTime() - new Date(lastUpdate).getTime()) < 5 * 60 * 1000 && purchase.status == 'APPROVED') {
            return {
                success: true,
                message: "Pago registrado correctamente."
            };
        }

        if (purchase.status == 'APPROVED') {
            throw new TransactionError("El pago ya fue realizado");
        }

        const trxData = await fetchTransaction(command.transactionId);
        if (!trxData) {
            throw new NotFoundError('La transacción no existe');
        }

        const status = requirePaymentStatus(trxData.status);

        await updatePurchaseById(command.purchaseId, {
            trxId: trxData.id,
            reference: trxData.reference,
            paymentMethod: trxData.paymentMethodType,
            trxCreationDate: trxData.createdAt,
            status,
        });

        if (status === 'APPROVED') {
            await assignCourse(user.id, requireCartCourseId(purchase.cart?.courseId));
        }

        return {
            success: true,
            message: "Pago registrado correctamente."
        };
    });
}

/**
 * 
 * @param trxData 
 * @returns 
 */
export const updateCoursePaymentTransaction = async (event: ApplyPaymentEventCommand): Promise<ApplyPaymentEventResult> => {
    return executeService(async () => {
        const purchase = await findUserPurchaseByReference(event.reference);
        if (!purchase) {
            throw new NotFoundError("La compra no existe");
        }

        // Webhook providers retry delivery. Replaying the same terminal event
        // must not assign the course twice or mutate the purchase again.
        if (purchase.trxId === event.transactionId && purchase.status === event.status) {
            return { outcome: 'already_applied' };
        }

        await updatePurchaseById(requirePersistentId(purchase.id, 'La compra'), {
            trxId: event.transactionId,
            reference: event.reference,
            paymentMethod: event.paymentMethod,
            trxCreationDate: event.occurredAt,
            status: event.status
        });

        if (event.status == 'APPROVED') {
            await assignCourse(requireCartUserId(purchase.cart?.userId), requireCartCourseId(purchase.cart?.courseId));
        }

        if (event.status == 'VOIDED') {
            await removeCourseFromUser(requireCartUserId(purchase.cart?.userId), requireCartCourseId(purchase.cart?.courseId));
        }

        return { outcome: 'applied' };
    });
}
