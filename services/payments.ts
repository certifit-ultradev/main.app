import { v4 as uuidv4 } from "uuid";
import { getCourseByCanonicalId, getUserCourseByCanonicalId } from "./courses"
import { generateSignature } from "@/utils/signature";
import { auth } from "@/auth";
import { findLastCoursePendingPurchase, findUserPurchaseById, findUserPurchaseByReference, storeCoursePaymentTransaction, updatePurchaseById } from "@/repository/payments";
import { fetchTransaction } from "./wompi";
import { Purchase } from "@/models/purchase";
import { NotFoundError } from "@/exceptions/not-found";
import { CourseAlreadyPurchasedError } from "@/exceptions/course-already-purchased";
import { TransactionEventUpdate } from "@/utils/types";
import { assignCourse } from "@/repository/users";
import { getPaymentReviewUrl } from "@/utils/url";
import { UserNotLoggedError } from "@/exceptions/user-not-logged";
import { CourseInvalidStateError } from "@/exceptions/course-invalid-state";
import { TransactionError } from "@/exceptions/transaction-error";
import { logPrismaError } from "@/exceptions/error-encoder";

const pubKey = process.env.WOMPI_PUB_KEY;
const sigData = process.env.WOMPI_SIG_DATA;

/**
 * 
 * @param courseCanonicalId 
 * @returns 
 */
export const quoteCoursePaymentTransaction = async (courseCanonicalId: string) => {
    try {
        const session = await auth();
        const userId = session?.user.id;
        if (!userId) {
            throw new UserNotLoggedError("El usuario debe loguearse");
        }
        console.log("session", session.user);
        const isEmailVerified = session?.user.emailVerified;
        if (!isEmailVerified) {
            throw new UserNotLoggedError("El usuario debe verificar su email");
        }
        const course = await getCourseByCanonicalId(courseCanonicalId);
        if (!course) {
            throw new NotFoundError("Curso no encontrado");
        }

        if (!course.isActive) {
            throw new CourseInvalidStateError("El curso no esta activo");
        }

        const alreadyPurchased = await getUserCourseByCanonicalId(course.canonicalId);
        if (alreadyPurchased?.userCourse?.length) {
            throw new CourseAlreadyPurchasedError("Curso ya ha sido comprado.");
        }

        let currentPurchase: Purchase | null = null;
        try {
            currentPurchase = await findLastCoursePendingPurchase(course.id as number, userId);
        } catch (error) {
            if (error instanceof NotFoundError) {
                currentPurchase = await storeCoursePaymentTransaction(course.id as number, userId, new Purchase({
                    cartId: 0,
                    trxId: "",
                    reference: uuidv4(),
                    paymentMethod: "",
                    trxCreationDate: new Date(),
                    total: course?.price,
                    subtotal: course?.price,
                    status: "PENDING"
                }));
                if (!currentPurchase) {
                    throw new TransactionError(`No se pudo crear la compra`);
                }
            }
        }

        return {
            purchaseId: currentPurchase?.id,
            currency: 'COP',
            amountInCents: (currentPurchase?.total as number) * 100,
            reference: currentPurchase?.reference,
            publicKey: pubKey,
            redirectUrl: getPaymentReviewUrl(),
            signature: { integrity: await generateSignature(currentPurchase?.reference as string, (currentPurchase?.total as number) * 100, sigData as string) },
            expirationTime: Date.now()
        };
    } catch (error) {
        console.log("error", error);
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @param purchaseId 
 * @param trxId 
 * @returns 
 */
export const createCoursePaymentTransaction = async (purchaseId: number, trxId: string) => {
    try {
        const session = await auth();
        const userId = session?.user.id;
        if (!userId) {
            throw new UserNotLoggedError("El usuario debe loguearse");
        }
        const isEmailVerified = session?.user.emailVerified;
        if (!isEmailVerified) {
            throw new UserNotLoggedError("El usuario debe verificar su email");
        }

        const purchase = await findUserPurchaseById(purchaseId, userId);
        if (!purchase) {
            throw new NotFoundError("La compra no existe");
        }

        if (purchase.status == 'APPROVED') {
            throw new TransactionError("El pago ya fue realizado");
        }

        const trxData = await fetchTransaction(trxId);
        if (!trxData) {
            throw new NotFoundError(`La transacción no existe ${trxId}`);
        }

        const updatedPurchase = await updatePurchaseById(purchaseId, {
            trxId: trxData?.id,
            reference: trxData.reference,
            paymentMethod: trxData.paymentMethodType,
            trxCreationDate: trxData.createdAt,
            status: trxData.status
        });

        if (trxData.status == 'APPROVED' && updatedPurchase) {
            const userCourse = await assignCourse(userId, purchase.cart?.courseId as number);
            if (!userCourse) {
                throw new TransactionError(`El pago no se pudo completar correctamente. trxId - ${trxId}`);
            }
        }

        if (!updatedPurchase) {
            throw new TransactionError(`El pago no se pudo completar correctamente. trxId - ${trxId}`);
        }

        return {
            success: true,
            message: "Pago registrado correctamente."
        };
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @param trxData 
 * @returns 
 */
export const updateCoursePaymentTransaction = async (trxData: TransactionEventUpdate) => {
    try {
        const purchase = await findUserPurchaseByReference(trxData.reference);
        if (!purchase) {
            throw new NotFoundError("La compra no existe");
        }

        const updatedPurchase = await updatePurchaseById(purchase.id as number, {
            trxId: trxData?.id,
            reference: trxData.reference,
            paymentMethod: trxData.paymentMethodType,
            trxCreationDate: trxData.createdAt,
            status: trxData.status
        });

        if (trxData.status == 'APPROVED' && updatedPurchase) {
            const userCourse = await assignCourse(purchase.cart?.userId as string, purchase.cart?.courseId as number);
            if (!userCourse) {
                throw new TransactionError(`La actualización del pago no se pudo completar correctamente. trxId - ${trxData.id}`);
            }
        }

        if (!updatedPurchase) {
            throw new TransactionError(`La actualización del pago no se pudo completar correctamente. trxId - ${trxData.id}`);
        }

        return {
            success: true,
            message: "Actualización del pago registrado correctamente."
        };
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}
