import { TransactionError } from "@/exceptions/transaction-error";
import { Transaction } from "@/models/transaction";
import { getTransaction } from '@/repository/wompi-api';
import { TransactionWompiResponse } from "@/utils/types";

// Mock global fetch
global.fetch = jest.fn();

jest.mock('@/models/transaction');

describe('Wompi API Repository Tests', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        jest.clearAllMocks();
        process.env = originalEnv;
    });

    describe('getTransaction', () => {
        test('debería obtener información de una transacción exitosamente', async () => {
            const trxId = 'trx-12345-abc';
            const mockWompiResponse: TransactionWompiResponse = {
                data: {
                    id: trxId,
                    created_at: new Date('2025-01-15'),
                    amount_in_cents: 10000000,
                    status: 'APPROVED',
                    reference: 'ref-xyz-789',
                    customer_email: 'customer@test.com',
                    currency: 'COP',
                    payment_method_type: 'NEQUI',
                    payment_method: {
                        phone_number: '+57 300 1234567'
                    },
                    redirect_url: 'https://example.com/success',
                    payment_link_id: 'link-abc-123'
                }
            };

            const mockTransaction = new Transaction({
                id: trxId,
                createdAt: new Date('2025-01-15'),
                amountInCents: 10000000,
                status: 'APPROVED',
                reference: 'ref-xyz-789',
                customerEmail: 'customer@test.com',
                currency: 'COP',
                paymentMethodType: 'NEQUI',
                paymentMethod: '+57 300 1234567',
                redirectUrl: 'https://example.com/success',
                paymentLinkId: 'link-abc-123'
            });

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue(mockWompiResponse),
                status: 200,
            });

            (Transaction.fromWompiResponse as jest.Mock).mockReturnValue(mockTransaction);

            const result = await getTransaction(trxId);

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining(`/transactions/${trxId}`),
                expect.objectContaining({
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
            );
            expect(Transaction.fromWompiResponse).toHaveBeenCalledWith(mockWompiResponse);
            expect(result).toBe(mockTransaction);
        });

        test('debería usar URL sandbox cuando APP_ENV no es PROD', async () => {
            process.env.APP_ENV = 'DEV';
            const trxId = 'trx-sandbox-test';

            const mockWompiResponse: TransactionWompiResponse = {
                data: {
                    id: trxId,
                    created_at: new Date(),
                    amount_in_cents: 5000000,
                    status: 'PENDING',
                    reference: 'ref-123',
                    customer_email: 'test@test.com',
                    currency: 'COP',
                    payment_method_type: 'PSE',
                    payment_method: {
                        phone_number: '+57 310 0000000'
                    },
                    redirect_url: 'https://example.com',
                    payment_link_id: 'link-123'
                }
            };

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue(mockWompiResponse),
                status: 200,
            });

            (Transaction.fromWompiResponse as jest.Mock).mockReturnValue({} as Transaction);

            await getTransaction(trxId);

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('sandbox.wompi.co'),
                expect.any(Object)
            );
        });

        test('debería usar URL sandbox por defecto cuando APP_ENV no está definida', async () => {
            delete process.env.APP_ENV;
            const trxId = 'trx-default-test';

            const mockWompiResponse: TransactionWompiResponse = {
                data: {
                    id: trxId,
                    created_at: new Date(),
                    amount_in_cents: 7500000,
                    status: 'APPROVED',
                    reference: 'ref-default',
                    customer_email: 'default@test.com',
                    currency: 'COP',
                    payment_method_type: 'CARD',
                    payment_method: {
                        phone_number: '+57 320 0000000'
                    },
                    redirect_url: 'https://default.example.com',
                    payment_link_id: 'link-default'
                }
            };

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue(mockWompiResponse),
                status: 200,
            });

            (Transaction.fromWompiResponse as jest.Mock).mockReturnValue({} as Transaction);

            await getTransaction(trxId);

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('sandbox.wompi.co'),
                expect.any(Object)
            );
        });

        test('debería lanzar TransactionError cuando la respuesta no es ok', async () => {
            const trxId = 'trx-error-404';

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: false,
                status: 404,
            });

            await expect(getTransaction(trxId))
                .rejects
                .toThrow(TransactionError);
            
            await expect(getTransaction(trxId))
                .rejects
                .toThrow('Error Wompi: Status 404');
        });

        test('debería lanzar TransactionError para diferentes códigos de error', async () => {
            const errorCodes = [400, 401, 403, 500, 503];
            const trxId = 'trx-error-test';

            for (const statusCode of errorCodes) {
                (global.fetch as jest.Mock).mockResolvedValue({
                    ok: false,
                    status: statusCode,
                });

                await expect(getTransaction(trxId))
                    .rejects
                    .toThrow(`Error Wompi: Status ${statusCode}`);
            }
        });

        test('debería incluir Content-Type en los headers', async () => {
            const trxId = 'trx-headers-test';

            const mockWompiResponse: TransactionWompiResponse = {
                data: {
                    id: trxId,
                    created_at: new Date(),
                    amount_in_cents: 1000000,
                    status: 'APPROVED',
                    reference: 'ref-headers',
                    customer_email: 'headers@test.com',
                    currency: 'COP',
                    payment_method_type: 'NEQUI',
                    payment_method: {
                        phone_number: '+57 300 9999999'
                    },
                    redirect_url: 'https://example.com',
                    payment_link_id: 'link-headers'
                }
            };

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue(mockWompiResponse),
                status: 200,
            });

            (Transaction.fromWompiResponse as jest.Mock).mockReturnValue({} as Transaction);

            await getTransaction(trxId);

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                    }),
                })
            );
        });

        test('debería usar método GET en la petición', async () => {
            const trxId = 'trx-method-test';

            const mockWompiResponse: TransactionWompiResponse = {
                data: {
                    id: trxId,
                    created_at: new Date(),
                    amount_in_cents: 2000000,
                    status: 'DECLINED',
                    reference: 'ref-method',
                    customer_email: 'method@test.com',
                    currency: 'COP',
                    payment_method_type: 'PSE',
                    payment_method: {
                        phone_number: '+57 310 8888888'
                    },
                    redirect_url: 'https://example.com',
                    payment_link_id: 'link-method'
                }
            };

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue(mockWompiResponse),
                status: 200,
            });

            (Transaction.fromWompiResponse as jest.Mock).mockReturnValue({} as Transaction);

            await getTransaction(trxId);

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    method: 'GET',
                })
            );
        });

        test('debería manejar diferentes transactionIds', async () => {
            const transactionIds = ['trx-1', 'trx-abc-xyz', 'transaction-12345'];

            for (const trxId of transactionIds) {
                const mockWompiResponse: TransactionWompiResponse = {
                    data: {
                        id: trxId,
                        created_at: new Date(),
                        amount_in_cents: 3000000,
                        status: 'APPROVED',
                        reference: `ref-${trxId}`,
                        customer_email: 'test@test.com',
                        currency: 'COP',
                        payment_method_type: 'NEQUI',
                        payment_method: {
                            phone_number: '+57 300 0000000'
                        },
                        redirect_url: 'https://example.com',
                        payment_link_id: 'link-test'
                    }
                };

                (global.fetch as jest.Mock).mockResolvedValue({
                    ok: true,
                    json: jest.fn().mockResolvedValue(mockWompiResponse),
                    status: 200,
                });

                (Transaction.fromWompiResponse as jest.Mock).mockReturnValue({} as Transaction);

                await getTransaction(trxId);

                expect(global.fetch).toHaveBeenCalledWith(
                    expect.stringContaining(`/transactions/${trxId}`),
                    expect.any(Object)
                );
            }
        });

        test('debería parsear correctamente el JSON de la respuesta', async () => {
            const trxId = 'trx-json-test';
            const mockWompiResponse: TransactionWompiResponse = {
                data: {
                    id: trxId,
                    created_at: new Date('2025-03-20'),
                    amount_in_cents: 15000000,
                    status: 'APPROVED',
                    reference: 'ref-json-test',
                    customer_email: 'json@test.com',
                    currency: 'COP',
                    payment_method_type: 'BANCOLOMBIA',
                    payment_method: {
                        phone_number: '+57 315 7777777'
                    },
                    redirect_url: 'https://json.example.com',
                    payment_link_id: 'link-json-test'
                }
            };

            const mockJsonFn = jest.fn().mockResolvedValue(mockWompiResponse);

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: mockJsonFn,
                status: 200,
            });

            (Transaction.fromWompiResponse as jest.Mock).mockReturnValue({} as Transaction);

            await getTransaction(trxId);

            expect(mockJsonFn).toHaveBeenCalled();
            expect(Transaction.fromWompiResponse).toHaveBeenCalledWith(mockWompiResponse);
        });

        test('debería manejar errores de red', async () => {
            const trxId = 'trx-network-error';
            const networkError = new Error('Network request failed');

            (global.fetch as jest.Mock).mockRejectedValue(networkError);

            await expect(getTransaction(trxId))
                .rejects
                .toThrow('Network request failed');
        });

        test('debería manejar respuestas con diferentes estados de transacción', async () => {
            const statuses = ['APPROVED', 'DECLINED', 'PENDING', 'ERROR', 'VOIDED'];
            const trxId = 'trx-status-test';

            for (const status of statuses) {
                const mockWompiResponse: TransactionWompiResponse = {
                    data: {
                        id: trxId,
                        created_at: new Date(),
                        amount_in_cents: 5000000,
                        status: status,
                        reference: `ref-${status}`,
                        customer_email: 'status@test.com',
                        currency: 'COP',
                        payment_method_type: 'NEQUI',
                        payment_method: {
                            phone_number: '+57 300 1111111'
                        },
                        redirect_url: 'https://example.com',
                        payment_link_id: 'link-status'
                    }
                };

                (global.fetch as jest.Mock).mockResolvedValue({
                    ok: true,
                    json: jest.fn().mockResolvedValue(mockWompiResponse),
                    status: 200,
                });

                const mockTransaction = { status } as Transaction;
                (Transaction.fromWompiResponse as jest.Mock).mockReturnValue(mockTransaction);

                const result = await getTransaction(trxId);

                expect(result.status).toBe(status);
            }
        });
    });
});
