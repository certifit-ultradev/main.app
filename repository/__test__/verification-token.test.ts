import { VerificationToken } from "@/models/verification-token";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/exceptions/not-found";
import {
    findVerificationTokenByToken,
    findVertificationTokenByEmail,
    createVerificationToken,
    deleteVerificationToken
} from '@/repository/verification-token';

jest.mock('@/lib/prisma', () => ({
    prisma: {
        verificationToken: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
        }
    }
}));

jest.mock('@/models/verification-token');

describe('Verification Token Repository Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findVerificationTokenByToken', () => {
        test('debería encontrar un token de verificación por token', async () => {
            const token = 'verify-token-abc123';
            const mockToken = {
                id: 'token-id-123',
                email: 'usuario@test.com',
                token: token,
                expires: new Date(Date.now() + 3600000),
            };

            (prisma.verificationToken.findUnique as jest.Mock).mockResolvedValue(mockToken);
            (VerificationToken as jest.Mock).mockImplementation((data) => data);

            const result = await findVerificationTokenByToken(token);

            expect(prisma.verificationToken.findUnique).toHaveBeenCalledWith({
                where: { token: token }
            });
            expect(VerificationToken).toHaveBeenCalledWith(mockToken);
            expect(result.token).toBe(token);
        });

        test('debería lanzar NotFoundError cuando el token no existe', async () => {
            const token = 'non-existent-token';

            (prisma.verificationToken.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(findVerificationTokenByToken(token))
                .rejects
                .toThrow(NotFoundError);
            
            expect(prisma.verificationToken.findUnique).toHaveBeenCalledWith({
                where: { token: token }
            });
        });

        test('debería buscar correctamente diferentes tokens', async () => {
            const tokens = ['token-1', 'token-2', 'token-3'];

            for (const token of tokens) {
                const mockToken = {
                    id: `id-${token}`,
                    email: 'test@test.com',
                    token: token,
                    expires: new Date(Date.now() + 3600000),
                };

                (prisma.verificationToken.findUnique as jest.Mock).mockResolvedValue(mockToken);
                (VerificationToken as jest.Mock).mockImplementation((data) => data);

                await findVerificationTokenByToken(token);

                expect(prisma.verificationToken.findUnique).toHaveBeenCalledWith({
                    where: { token }
                });
            }
        });
    });

    describe('findVertificationTokenByEmail', () => {
        test('debería encontrar un token de verificación por email', async () => {
            const email = 'usuario@test.com';
            const mockToken = {
                id: 'token-email-123',
                email: email,
                token: 'verify-token-xyz',
                expires: new Date(Date.now() + 7200000),
            };

            (prisma.verificationToken.findFirst as jest.Mock).mockResolvedValue(mockToken);
            (VerificationToken as jest.Mock).mockImplementation((data) => data);

            const result = await findVertificationTokenByEmail(email);

            expect(prisma.verificationToken.findFirst).toHaveBeenCalledWith({
                where: { email: email }
            });
            expect(VerificationToken).toHaveBeenCalledWith(mockToken);
            expect(result.email).toBe(email);
        });

        test('debería lanzar NotFoundError cuando el email no tiene token', async () => {
            const email = 'noexiste@test.com';

            (prisma.verificationToken.findFirst as jest.Mock).mockResolvedValue(null);

            await expect(findVertificationTokenByEmail(email))
                .rejects
                .toThrow(NotFoundError);
            
            expect(prisma.verificationToken.findFirst).toHaveBeenCalledWith({
                where: { email: email }
            });
        });

        test('debería buscar tokens con diferentes emails', async () => {
            const emails = ['user1@test.com', 'user2@test.com', 'user3@test.com'];

            for (const email of emails) {
                const mockToken = {
                    id: `token-${email}`,
                    email: email,
                    token: `token-for-${email}`,
                    expires: new Date(Date.now() + 3600000),
                };

                (prisma.verificationToken.findFirst as jest.Mock).mockResolvedValue(mockToken);
                (VerificationToken as jest.Mock).mockImplementation((data) => data);

                await findVertificationTokenByEmail(email);

                expect(prisma.verificationToken.findFirst).toHaveBeenCalledWith({
                    where: { email }
                });
            }
        });

        test('debería retornar el token correcto para el email', async () => {
            const email = 'correct@test.com';
            const correctToken = 'correct-token-123';
            const mockToken = {
                id: 'correct-id',
                email: email,
                token: correctToken,
                expires: new Date(Date.now() + 3600000),
            };

            (prisma.verificationToken.findFirst as jest.Mock).mockResolvedValue(mockToken);
            (VerificationToken as jest.Mock).mockImplementation((data) => data);

            const result = await findVertificationTokenByEmail(email);

            expect(result.token).toBe(correctToken);
            expect(result.email).toBe(email);
        });
    });

    describe('createVerificationToken', () => {
        test('debería crear un token de verificación correctamente', async () => {
            const verification = new VerificationToken({
                email: 'nuevo@test.com',
                token: 'new-verify-token-abc',
                expires: new Date(Date.now() + 3600000),
            });

            const mockCreatedToken = {
                id: 'new-token-id',
                email: 'nuevo@test.com',
                token: 'new-verify-token-abc',
                expires: new Date(Date.now() + 3600000),
            };

            (prisma.verificationToken.create as jest.Mock).mockResolvedValue(mockCreatedToken);
            (VerificationToken as jest.Mock).mockImplementation((data) => data);

            const result = await createVerificationToken(verification);

            expect(prisma.verificationToken.create).toHaveBeenCalledWith({
                data: verification
            });
            expect(VerificationToken).toHaveBeenCalledWith(mockCreatedToken);
            expect(result).toBeDefined();
            expect(result?.email).toBe('nuevo@test.com');
        });

        test('debería retornar null si la creación falla', async () => {
            const verification = new VerificationToken({
                email: 'fail@test.com',
                token: 'fail-token',
                expires: new Date(Date.now() + 3600000),
            });

            (prisma.verificationToken.create as jest.Mock).mockResolvedValue(null);

            const result = await createVerificationToken(verification);

            expect(result).toBeNull();
            expect(prisma.verificationToken.create).toHaveBeenCalledWith({
                data: verification
            });
        });

        test('debería manejar errores durante la creación', async () => {
            const verification = new VerificationToken({
                email: 'error@test.com',
                token: 'error-token',
                expires: new Date(Date.now() + 3600000),
            });

            const error = new Error('Database error');
            (prisma.verificationToken.create as jest.Mock).mockRejectedValue(error);

            await expect(createVerificationToken(verification))
                .rejects
                .toThrow('Database error');
            
            expect(prisma.verificationToken.create).toHaveBeenCalledWith({
                data: verification
            });
        });

        test('debería crear tokens con diferentes fechas de expiración', async () => {
            const expirationDates = [
                new Date(Date.now() + 1800000), // 30 minutos
                new Date(Date.now() + 3600000), // 1 hora
                new Date(Date.now() + 7200000), // 2 horas
            ];

            for (const expires of expirationDates) {
                const verification = new VerificationToken({
                    email: 'test@test.com',
                    token: `token-${expires.getTime()}`,
                    expires: expires,
                });

                const mockCreatedToken = {
                    id: 'token-id',
                    ...verification,
                };

                (prisma.verificationToken.create as jest.Mock).mockResolvedValue(mockCreatedToken);
                (VerificationToken as jest.Mock).mockImplementation((data) => data);

                const result = await createVerificationToken(verification);

                expect(result?.expires).toEqual(expires);
            }
        });

        test('debería crear token con todos los campos correctos', async () => {
            const verification = new VerificationToken({
                email: 'complete@test.com',
                token: 'complete-token-xyz789',
                expires: new Date('2025-12-31'),
            });

            const mockCreatedToken = {
                id: 'complete-id',
                email: 'complete@test.com',
                token: 'complete-token-xyz789',
                expires: new Date('2025-12-31'),
            };

            (prisma.verificationToken.create as jest.Mock).mockResolvedValue(mockCreatedToken);
            (VerificationToken as jest.Mock).mockImplementation((data) => data);

            const result = await createVerificationToken(verification);

            expect(result).toMatchObject({
                email: 'complete@test.com',
                token: 'complete-token-xyz789',
            });
        });
    });

    describe('deleteVerificationToken', () => {
        test('debería eliminar un token de verificación por ID', async () => {
            const tokenId = 'token-to-delete-123';
            const mockDeletedToken = {
                id: tokenId,
                email: 'delete@test.com',
                token: 'delete-token',
                expires: new Date(),
            };

            (prisma.verificationToken.delete as jest.Mock).mockResolvedValue(mockDeletedToken);

            const result = await deleteVerificationToken(tokenId);

            expect(prisma.verificationToken.delete).toHaveBeenCalledWith({
                where: { id: tokenId }
            });
            expect(result).toEqual(mockDeletedToken);
        });

        test('debería manejar errores al eliminar un token', async () => {
            const tokenId = 'non-existent-id';
            const error = new Error('Record not found');

            (prisma.verificationToken.delete as jest.Mock).mockRejectedValue(error);

            await expect(deleteVerificationToken(tokenId))
                .rejects
                .toThrow('Record not found');
            
            expect(prisma.verificationToken.delete).toHaveBeenCalledWith({
                where: { id: tokenId }
            });
        });

        test('debería eliminar múltiples tokens correctamente', async () => {
            const tokenIds = ['id-1', 'id-2', 'id-3'];

            for (const id of tokenIds) {
                const mockDeletedToken = {
                    id: id,
                    email: 'test@test.com',
                    token: `token-${id}`,
                    expires: new Date(),
                };

                (prisma.verificationToken.delete as jest.Mock).mockResolvedValue(mockDeletedToken);

                const result = await deleteVerificationToken(id);

                expect(result.id).toBe(id);
                expect(prisma.verificationToken.delete).toHaveBeenCalledWith({
                    where: { id }
                });
            }
        });

        test('debería retornar el token eliminado completo', async () => {
            const tokenId = 'full-token-id';
            const mockDeletedToken = {
                id: tokenId,
                email: 'full@test.com',
                token: 'full-token-string',
                expires: new Date('2025-06-15'),
            };

            (prisma.verificationToken.delete as jest.Mock).mockResolvedValue(mockDeletedToken);

            const result = await deleteVerificationToken(tokenId);

            expect(result).toMatchObject({
                id: tokenId,
                email: 'full@test.com',
                token: 'full-token-string',
            });
        });
    });
});
