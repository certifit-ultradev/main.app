import { Purchase } from "@/models/purchase";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/exceptions/not-found";
import {
    storeCoursePaymentTransaction,
    updatePurchaseById,
    findUserPurchaseById,
    findUserPurchaseByReference,
    findLastCoursePendingPurchase
} from '@/repository/payments';

jest.mock('@/lib/prisma', () => ({
    prisma: {
        $transaction: jest.fn(),
        purchase: {
            create: jest.fn(),
            update: jest.fn(),
            findFirst: jest.fn(),
        },
        cart: {
            create: jest.fn(),
        }
    }
}));

jest.mock('@/models/purchase');

describe('Payments Repository Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('storeCoursePaymentTransaction', () => {
        test('debería crear un carrito y una compra en una transacción', async () => {
            const courseId = 10;
            const userId = 'user-123';
            const purchase = new Purchase({
                cartId: 0, // Se asignará después
                trxId: 'trx-abc-123',
                reference: 'ref-xyz-456',
                paymentMethod: 'NEQUI',
                trxCreationDate: new Date('2025-01-01'),
                total: 100000,
                subtotal: 85000,
                status: 'APPROVED',
            });

            const mockCart = {
                id: 999,
                userId: userId,
                courseId: courseId,
                createdAt: new Date(),
            };

            const mockPurchase = {
                id: 1,
                cartId: 999,
                trxId: 'trx-abc-123',
                reference: 'ref-xyz-456',
                paymentMethod: 'NEQUI',
                trxCreationDate: new Date('2025-01-01'),
                total: 100000,
                subtotal: 85000,
                status: 'APPROVED',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const mockTransactionFn = jest.fn(async (callback) => {
                const tx = {
                    cart: { create: jest.fn().mockResolvedValue(mockCart) },
                    purchase: { create: jest.fn().mockResolvedValue(mockPurchase) },
                };
                return await callback(tx);
            });

            (prisma.$transaction as jest.Mock).mockImplementation(mockTransactionFn);
            (Purchase as jest.Mock).mockImplementation((data) => data);

            const result = await storeCoursePaymentTransaction(courseId, userId, purchase);

            expect(prisma.$transaction).toHaveBeenCalledTimes(1);
            expect(result).toBeDefined();
            expect(result?.cartId).toBe(999);
            expect(result?.trxId).toBe('trx-abc-123');
            expect(result?.reference).toBe('ref-xyz-456');
        });

        test('debería asignar el cartId al purchase dentro de la transacción', async () => {
            const courseId = 5;
            const userId = 'user-456';
            const purchase = new Purchase({
                cartId: 0,
                trxId: 'trx-test',
                reference: 'ref-test',
                paymentMethod: 'PSE',
                trxCreationDate: new Date(),
                total: 50000,
                subtotal: 45000,
                status: 'PENDING',
            });

            const mockCart = { id: 777, userId, courseId, createdAt: new Date() };
            const mockPurchase = {
                id: 2,
                cartId: 777,
                trxId: 'trx-test',
                reference: 'ref-test',
                paymentMethod: 'PSE',
                trxCreationDate: new Date(),
                total: 50000,
                subtotal: 45000,
                status: 'PENDING',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const mockTransactionFn = jest.fn(async (callback) => {
                const tx = {
                    cart: { create: jest.fn().mockResolvedValue(mockCart) },
                    purchase: { create: jest.fn().mockResolvedValue(mockPurchase) },
                };
                return await callback(tx);
            });

            (prisma.$transaction as jest.Mock).mockImplementation(mockTransactionFn);
            (Purchase as jest.Mock).mockImplementation((data) => data);

            const result = await storeCoursePaymentTransaction(courseId, userId, purchase);

            expect(purchase.cartId).toBe(777);
            expect(result).toBeDefined();
            expect(result?.cartId).toBe(777);
        });

        test('debería manejar errores en la transacción', async () => {
            const courseId = 1;
            const userId = 'user-error';
            const purchase = new Purchase({
                cartId: 0,
                trxId: 'trx-error',
                reference: 'ref-error',
                paymentMethod: 'BANCOLOMBIA',
                trxCreationDate: new Date(),
                total: 75000,
                subtotal: 70000,
                status: 'PENDING',
            });

            const error = new Error('Transaction failed');
            (prisma.$transaction as jest.Mock).mockRejectedValue(error);

            await expect(storeCoursePaymentTransaction(courseId, userId, purchase))
                .rejects
                .toThrow('Transaction failed');
            
            expect(prisma.$transaction).toHaveBeenCalledTimes(1);
        });

        test('debería crear purchase con todos los datos correctos', async () => {
            const courseId = 20;
            const userId = 'user-complete';
            const trxDate = new Date('2025-02-15');
            const purchase = new Purchase({
                cartId: 0,
                trxId: 'trx-complete-123',
                reference: 'ref-complete-456',
                paymentMethod: 'CARD',
                trxCreationDate: trxDate,
                total: 200000,
                subtotal: 180000,
                status: 'APPROVED',
            });

            const mockCart = { id: 555, userId, courseId, createdAt: new Date() };
            const mockPurchase = {
                id: 5,
                cartId: 555,
                trxId: 'trx-complete-123',
                reference: 'ref-complete-456',
                paymentMethod: 'CARD',
                trxCreationDate: trxDate,
                total: 200000,
                subtotal: 180000,
                status: 'APPROVED',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const mockTransactionFn = jest.fn(async (callback) => {
                const tx = {
                    cart: { create: jest.fn().mockResolvedValue(mockCart) },
                    purchase: { create: jest.fn().mockResolvedValue(mockPurchase) },
                };
                return await callback(tx);
            });

            (prisma.$transaction as jest.Mock).mockImplementation(mockTransactionFn);
            (Purchase as jest.Mock).mockImplementation((data) => data);

            const result = await storeCoursePaymentTransaction(courseId, userId, purchase);

            expect(result).toMatchObject({
                trxId: 'trx-complete-123',
                reference: 'ref-complete-456',
                paymentMethod: 'CARD',
                total: 200000,
                subtotal: 180000,
                status: 'APPROVED',
            });
        });
    });

    describe('updatePurchaseById', () => {
        test('debería actualizar una compra excluyendo campos no permitidos', async () => {
            const purchaseId = 10;
            const updateData = {
                status: 'APPROVED',
                total: 120000,
                subtotal: 110000,
            };

            const mockUpdatedPurchase = {
                id: purchaseId,
                cartId: 100,
                trxId: 'trx-update',
                reference: 'ref-update',
                paymentMethod: 'NEQUI',
                trxCreationDate: new Date(),
                total: 120000,
                subtotal: 110000,
                status: 'APPROVED',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (prisma.purchase.update as jest.Mock).mockResolvedValue(mockUpdatedPurchase);

            const result = await updatePurchaseById(purchaseId, updateData);

            expect(prisma.purchase.update).toHaveBeenCalledWith({
                where: { id: purchaseId },
                data: {
                    status: 'APPROVED',
                    total: 120000,
                    subtotal: 110000,
                }
            });
            expect(result).toEqual(mockUpdatedPurchase);
        });

        test('debería excluir id, cartId y cart del updateData', async () => {
            const purchaseId = 20;
            const updateData: Partial<Purchase> = {
                id: 999, // No debería incluirse
                cartId: 888, // No debería incluirse
                cart: { id: 1, userId: 'test', courseId: 1 } as any, // No debería incluirse
                status: 'DECLINED',
                total: 50000,
            };

            const mockUpdatedPurchase = {
                id: purchaseId,
                cartId: 100,
                trxId: 'trx-test',
                reference: 'ref-test',
                paymentMethod: 'PSE',
                trxCreationDate: new Date(),
                total: 50000,
                subtotal: 45000,
                status: 'DECLINED',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (prisma.purchase.update as jest.Mock).mockResolvedValue(mockUpdatedPurchase);

            await updatePurchaseById(purchaseId, updateData);

            expect(prisma.purchase.update).toHaveBeenCalledWith({
                where: { id: purchaseId },
                data: expect.not.objectContaining({
                    id: expect.anything(),
                    cartId: expect.anything(),
                    cart: expect.anything(),
                })
            });
        });

        test('debería manejar errores al actualizar', async () => {
            const purchaseId = 30;
            const updateData = { status: 'ERROR' };
            const error = new Error('Update failed');

            (prisma.purchase.update as jest.Mock).mockRejectedValue(error);

            await expect(updatePurchaseById(purchaseId, updateData))
                .rejects
                .toThrow('Update failed');
        });
    });

    describe('findUserPurchaseById', () => {
        test('debería encontrar una compra por ID y userId', async () => {
            const purchaseId = 15;
            const userId = 'user-find-123';

            const mockPurchase = {
                id: purchaseId,
                cartId: 200,
                trxId: 'trx-find',
                reference: 'ref-find',
                paymentMethod: 'NEQUI',
                trxCreationDate: new Date(),
                total: 90000,
                subtotal: 85000,
                status: 'APPROVED',
                createdAt: new Date(),
                updatedAt: new Date(),
                cart: {
                    id: 200,
                    userId: userId,
                    courseId: 5,
                    createdAt: new Date(),
                }
            };

            (prisma.purchase.findFirst as jest.Mock).mockResolvedValue(mockPurchase);
            (Purchase as jest.Mock).mockImplementation((data) => data);

            const result = await findUserPurchaseById(purchaseId, userId);

            expect(prisma.purchase.findFirst).toHaveBeenCalledWith({
                relationLoadStrategy: 'join',
                include: {
                    cart: true
                },
                where: {
                    id: purchaseId,
                    cart: {
                        userId: userId
                    }
                }
            });
            expect(result).toBeDefined();
            expect(result.id).toBe(purchaseId);
        });

        test('debería lanzar NotFoundError cuando la compra no existe', async () => {
            const purchaseId = 999;
            const userId = 'user-not-found';

            (prisma.purchase.findFirst as jest.Mock).mockResolvedValue(null);

            await expect(findUserPurchaseById(purchaseId, userId))
                .rejects
                .toThrow(NotFoundError);
            
            expect(prisma.purchase.findFirst).toHaveBeenCalled();
        });

        test('debería incluir el cart en la respuesta', async () => {
            const purchaseId = 25;
            const userId = 'user-with-cart';

            const mockPurchase = {
                id: purchaseId,
                cartId: 300,
                trxId: 'trx-cart',
                reference: 'ref-cart',
                paymentMethod: 'PSE',
                trxCreationDate: new Date(),
                total: 150000,
                subtotal: 140000,
                status: 'APPROVED',
                createdAt: new Date(),
                updatedAt: new Date(),
                cart: {
                    id: 300,
                    userId: userId,
                    courseId: 10,
                    createdAt: new Date(),
                }
            };

            (prisma.purchase.findFirst as jest.Mock).mockResolvedValue(mockPurchase);
            (Purchase as jest.Mock).mockImplementation((data) => data);

            const result = await findUserPurchaseById(purchaseId, userId);

            expect(result.cart).toBeDefined();
            expect(result.cart?.userId).toBe(userId);
        });
    });

    describe('findUserPurchaseByReference', () => {
        test('debería encontrar una compra por reference', async () => {
            const reference = 'ref-unique-123';

            const mockPurchase = {
                id: 40,
                cartId: 400,
                trxId: 'trx-ref',
                reference: reference,
                paymentMethod: 'BANCOLOMBIA',
                trxCreationDate: new Date(),
                total: 75000,
                subtotal: 70000,
                status: 'PENDING',
                createdAt: new Date(),
                updatedAt: new Date(),
                cart: {
                    id: 400,
                    userId: 'user-ref-123',
                    courseId: 15,
                    createdAt: new Date(),
                }
            };

            (prisma.purchase.findFirst as jest.Mock).mockResolvedValue(mockPurchase);
            (Purchase as jest.Mock).mockImplementation((data) => data);

            const result = await findUserPurchaseByReference(reference);

            expect(prisma.purchase.findFirst).toHaveBeenCalledWith({
                relationLoadStrategy: 'join',
                include: {
                    cart: true
                },
                where: {
                    reference: reference
                }
            });
            expect(result.reference).toBe(reference);
        });

        test('debería lanzar NotFoundError cuando la referencia no existe', async () => {
            const reference = 'ref-not-exists';

            (prisma.purchase.findFirst as jest.Mock).mockResolvedValue(null);

            await expect(findUserPurchaseByReference(reference))
                .rejects
                .toThrow(NotFoundError);
        });

        test('debería buscar con diferentes referencias', async () => {
            const references = ['ref-1', 'ref-2', 'ref-3'];

            for (const reference of references) {
                const mockPurchase = {
                    id: 50,
                    cartId: 500,
                    trxId: 'trx-test',
                    reference: reference,
                    paymentMethod: 'NEQUI',
                    trxCreationDate: new Date(),
                    total: 100000,
                    subtotal: 95000,
                    status: 'APPROVED',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    cart: {
                        id: 500,
                        userId: 'user-test',
                        courseId: 20,
                        createdAt: new Date(),
                    }
                };

                (prisma.purchase.findFirst as jest.Mock).mockResolvedValue(mockPurchase);
                (Purchase as jest.Mock).mockImplementation((data) => data);

                await findUserPurchaseByReference(reference);

                expect(prisma.purchase.findFirst).toHaveBeenCalledWith(
                    expect.objectContaining({
                        where: { reference }
                    })
                );
            }
        });
    });

    describe('findLastCoursePendingPurchase', () => {
        test('debería encontrar la última compra pendiente de un curso', async () => {
            const courseId = 25;
            const userId = 'user-pending-123';

            const mockPurchase = {
                id: 60,
                cartId: 600,
                trxId: 'trx-pending',
                reference: 'ref-pending',
                paymentMethod: 'PSE',
                trxCreationDate: new Date(),
                total: 130000,
                subtotal: 120000,
                status: 'PENDING',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (prisma.purchase.findFirst as jest.Mock).mockResolvedValue(mockPurchase);
            (Purchase as jest.Mock).mockImplementation((data) => data);

            const result = await findLastCoursePendingPurchase(courseId, userId);

            expect(prisma.purchase.findFirst).toHaveBeenCalledWith({
                relationLoadStrategy: 'join',
                where: {
                    status: "PENDING",
                    cart: {
                        userId: userId,
                        courseId: courseId
                    }
                }
            });
            expect(result).toBeDefined();
            expect(result?.status).toBe('PENDING');
        });

        test('debería lanzar NotFoundError cuando no hay compras pendientes', async () => {
            const courseId = 30;
            const userId = 'user-no-pending';

            (prisma.purchase.findFirst as jest.Mock).mockResolvedValue(null);

            await expect(findLastCoursePendingPurchase(courseId, userId))
                .rejects
                .toThrow(NotFoundError);
            
            expect(prisma.purchase.findFirst).toHaveBeenCalled();
        });

        test('debería buscar solo compras con estado PENDING', async () => {
            const courseId = 35;
            const userId = 'user-status-check';

            const mockPurchase = {
                id: 70,
                cartId: 700,
                trxId: 'trx-status',
                reference: 'ref-status',
                paymentMethod: 'CARD',
                trxCreationDate: new Date(),
                total: 95000,
                subtotal: 90000,
                status: 'PENDING',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (prisma.purchase.findFirst as jest.Mock).mockResolvedValue(mockPurchase);
            (Purchase as jest.Mock).mockImplementation((data) => data);

            await findLastCoursePendingPurchase(courseId, userId);

            expect(prisma.purchase.findFirst).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        status: "PENDING"
                    })
                })
            );
        });

        test('debería filtrar por courseId y userId correctos', async () => {
            const courseId = 40;
            const userId = 'user-filter-test';

            const mockPurchase = {
                id: 80,
                cartId: 800,
                trxId: 'trx-filter',
                reference: 'ref-filter',
                paymentMethod: 'NEQUI',
                trxCreationDate: new Date(),
                total: 110000,
                subtotal: 105000,
                status: 'PENDING',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (prisma.purchase.findFirst as jest.Mock).mockResolvedValue(mockPurchase);
            (Purchase as jest.Mock).mockImplementation((data) => data);

            await findLastCoursePendingPurchase(courseId, userId);

            expect(prisma.purchase.findFirst).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        status: "PENDING",
                        cart: {
                            userId: userId,
                            courseId: courseId
                        }
                    }
                })
            );
        });
    });
});
