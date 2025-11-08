import { PasswordResetToken } from "@/models/password-reset-token";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/exceptions/not-found";
import {
    findPasswordResetTokenByToken,
    findPasswordResetTokenByPhoneNumber,
    findPasswordResetTokenByEmail,
    createPasswordResetToken,
    deletePasswordResetToken
} from '@/repository/password-reset-token';

jest.mock('@/lib/prisma', () => ({
    prisma: {
        passwordResetToken: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
        }
    }
}));

jest.mock('@/models/password-reset-token');

describe('Password Reset Token Repository Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findPasswordResetTokenByToken', () => {
        test('debería retornar un PasswordResetToken cuando existe', async () => {
            const mockToken = {
                id: 'token-123',
                email: 'usuario@test.com',
                token: 'reset-token-abc123',
                expires: new Date(Date.now() + 3600000),
            };
            const mockTokenInstance = { ...mockToken };

            (prisma.passwordResetToken.findUnique as jest.Mock).mockResolvedValue(mockToken);
            (PasswordResetToken as jest.Mock).mockImplementation(() => mockTokenInstance);

            const result = await findPasswordResetTokenByToken('reset-token-abc123');

            expect(prisma.passwordResetToken.findUnique).toHaveBeenCalledWith({
                where: { token: 'reset-token-abc123' }
            });
            expect(PasswordResetToken).toHaveBeenCalledWith(mockToken);
            expect(result).toEqual(mockTokenInstance);
        });

        test('debería lanzar NotFoundError cuando el token no existe', async () => {
            (prisma.passwordResetToken.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(findPasswordResetTokenByToken('non-existent-token'))
                .rejects
                .toThrow(NotFoundError);
            
            expect(prisma.passwordResetToken.findUnique).toHaveBeenCalledWith({
                where: { token: 'non-existent-token' }
            });
        });
    });

    describe('findPasswordResetTokenByPhoneNumber', () => {
        test('debería retornar un PasswordResetToken cuando existe por número de teléfono', async () => {
            const mockToken = {
                id: 'token-phone-123',
                email: '+57 300 1234567',
                token: 'phone-reset-token',
                expires: new Date(Date.now() + 3600000),
            };
            const mockTokenInstance = { ...mockToken };

            (prisma.passwordResetToken.findFirst as jest.Mock).mockResolvedValue(mockToken);
            (PasswordResetToken as jest.Mock).mockImplementation(() => mockTokenInstance);

            const result = await findPasswordResetTokenByPhoneNumber('+57 300 1234567');

            expect(prisma.passwordResetToken.findFirst).toHaveBeenCalledWith({
                where: { email: '+57 300 1234567' }
            });
            expect(PasswordResetToken).toHaveBeenCalledWith(mockToken);
            expect(result).toEqual(mockTokenInstance);
        });

        test('debería lanzar NotFoundError cuando no encuentra token por teléfono', async () => {
            (prisma.passwordResetToken.findFirst as jest.Mock).mockResolvedValue(null);

            await expect(findPasswordResetTokenByPhoneNumber('+57 300 9999999'))
                .rejects
                .toThrow(NotFoundError);
            
            expect(prisma.passwordResetToken.findFirst).toHaveBeenCalledWith({
                where: { email: '+57 300 9999999' }
            });
        });
    });

    describe('findPasswordResetTokenByEmail', () => {
        test('debería retornar un PasswordResetToken cuando existe por email', async () => {
            const mockToken = {
                id: 'token-email-123',
                email: 'usuario@test.com',
                token: 'email-reset-token',
                expires: new Date(Date.now() + 3600000),
            };
            const mockTokenInstance = { ...mockToken };

            (prisma.passwordResetToken.findFirst as jest.Mock).mockResolvedValue(mockToken);
            (PasswordResetToken as jest.Mock).mockImplementation(() => mockTokenInstance);

            const result = await findPasswordResetTokenByEmail('usuario@test.com');

            expect(prisma.passwordResetToken.findFirst).toHaveBeenCalledWith({
                where: { email: 'usuario@test.com' }
            });
            expect(PasswordResetToken).toHaveBeenCalledWith(mockToken);
            expect(result).toEqual(mockTokenInstance);
        });

        test('debería lanzar NotFoundError cuando no encuentra token por email', async () => {
            (prisma.passwordResetToken.findFirst as jest.Mock).mockResolvedValue(null);

            await expect(findPasswordResetTokenByEmail('noexiste@test.com'))
                .rejects
                .toThrow(NotFoundError);
            
            expect(prisma.passwordResetToken.findFirst).toHaveBeenCalledWith({
                where: { email: 'noexiste@test.com' }
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

                (prisma.passwordResetToken.findFirst as jest.Mock).mockResolvedValue(mockToken);
                (PasswordResetToken as jest.Mock).mockImplementation(() => ({ ...mockToken }));

                await findPasswordResetTokenByEmail(email);

                expect(prisma.passwordResetToken.findFirst).toHaveBeenCalledWith({
                    where: { email }
                });
            }
        });
    });

    describe('createPasswordResetToken', () => {
        test('debería crear y retornar un nuevo token de restablecimiento', async () => {
            const tokenData: PasswordResetToken = {
                id: 'new-token-id',
                email: 'nuevo@test.com',
                token: 'new-reset-token-xyz',
                expires: new Date(Date.now() + 3600000),
            };

            const mockCreatedToken = { ...tokenData };

            (prisma.passwordResetToken.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.passwordResetToken.create as jest.Mock).mockResolvedValue(mockCreatedToken);

            const result = await createPasswordResetToken(tokenData);

            expect(prisma.passwordResetToken.create).toHaveBeenCalledWith({
                data: {
                    email: tokenData.email,
                    token: tokenData.token,
                    expires: tokenData.expires,
                }
            });
            expect(result).toEqual(mockCreatedToken);
        });

        test('debería lanzar error cuando el email es inválido', async () => {
            const tokenData = {
                email: '',
                token: 'invalid-token',
                expires: new Date(),
            } as PasswordResetToken;

            await expect(createPasswordResetToken(tokenData))
                .rejects
                .toThrow('No se pudo crear un token de verificación, el correo es invalido');
        });

        test('debería eliminar token existente antes de crear uno nuevo', async () => {
            const existingToken = {
                id: 'existing-token-id',
                email: 'usuario@test.com',
                token: 'existing-token',
                expires: new Date(Date.now() + 1800000),
            };

            const newTokenData: PasswordResetToken = {
                id: 'new-token-id',
                email: 'usuario@test.com',
                token: 'new-token-xyz',
                expires: new Date(Date.now() + 3600000),
            };

            (prisma.passwordResetToken.findFirst as jest.Mock)
                .mockResolvedValueOnce(existingToken) // Primera llamada en el catch
                .mockResolvedValueOnce(null); // Segunda llamada después del delete
            (prisma.passwordResetToken.delete as jest.Mock).mockResolvedValue(existingToken);
            (prisma.passwordResetToken.create as jest.Mock).mockResolvedValue(newTokenData);
            (PasswordResetToken as jest.Mock).mockImplementation((data) => data);

            const result = await createPasswordResetToken(newTokenData);

            expect(prisma.passwordResetToken.create).toHaveBeenCalledWith({
                data: {
                    email: newTokenData.email,
                    token: newTokenData.token,
                    expires: newTokenData.expires,
                }
            });
            expect(result).toEqual(newTokenData);
        });

        test('debería crear token cuando no existe uno previo', async () => {
            const tokenData: PasswordResetToken = {
                id: 'brand-new-token',
                email: 'sintoken@test.com',
                token: 'brand-new-reset-token',
                expires: new Date(Date.now() + 3600000),
            };

            (prisma.passwordResetToken.findFirst as jest.Mock).mockRejectedValue(
                new NotFoundError('Token de cambio de contraseña no encontrado')
            );
            (prisma.passwordResetToken.create as jest.Mock).mockResolvedValue(tokenData);

            const result = await createPasswordResetToken(tokenData);

            expect(prisma.passwordResetToken.create).toHaveBeenCalledWith({
                data: {
                    email: tokenData.email,
                    token: tokenData.token,
                    expires: tokenData.expires,
                }
            });
            expect(result).toEqual(tokenData);
        });
    });

    describe('deletePasswordResetToken', () => {
        test('debería eliminar un token correctamente', async () => {
            const tokenToDelete = 'token-to-delete-abc';
            const mockDeletedToken = {
                id: 'deleted-token-id',
                email: 'usuario@test.com',
                token: tokenToDelete,
                expires: new Date(),
            };

            (prisma.passwordResetToken.delete as jest.Mock).mockResolvedValue(mockDeletedToken);

            const result = await deletePasswordResetToken(tokenToDelete);

            expect(prisma.passwordResetToken.delete).toHaveBeenCalledWith({
                where: { token: tokenToDelete }
            });
            expect(result).toEqual(mockDeletedToken);
        });

        test('debería manejar errores al eliminar un token', async () => {
            const tokenToDelete = 'non-existent-delete-token';
            const error = new Error('Record not found');

            (prisma.passwordResetToken.delete as jest.Mock).mockRejectedValue(error);

            await expect(deletePasswordResetToken(tokenToDelete)).rejects.toThrow('Record not found');
            expect(prisma.passwordResetToken.delete).toHaveBeenCalledWith({
                where: { token: tokenToDelete }
            });
        });

        test('debería eliminar múltiples tokens correctamente', async () => {
            const tokens = ['token-1', 'token-2', 'token-3'];

            for (const token of tokens) {
                const mockDeletedToken = {
                    id: `id-${token}`,
                    email: 'test@test.com',
                    token: token,
                    expires: new Date(),
                };

                (prisma.passwordResetToken.delete as jest.Mock).mockResolvedValue(mockDeletedToken);

                const result = await deletePasswordResetToken(token);

                expect(result.token).toBe(token);
                expect(prisma.passwordResetToken.delete).toHaveBeenCalledWith({
                    where: { token }
                });
            }
        });
    });
});
