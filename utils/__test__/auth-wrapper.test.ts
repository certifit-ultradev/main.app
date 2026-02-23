import { auth } from "@/auth";
import { UserNotLoggedError } from "@/exceptions/user-not-logged";
import { 
    getAuthenticatedUser, 
    withAuth, 
    withAdminAuth, 
    getOptionalUserId,
    AuthenticatedUser 
} from "@/utils/auth-wrapper";

jest.mock("@/auth");

describe('Auth Wrapper Utils', () => {
    const mockAuth = auth as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAuthenticatedUser', () => {
        const validSession = {
            user: {
                id: 'user-123',
                email: 'test@example.com',
                emailVerified: new Date('2024-01-01'),
                isAdmin: false,
            }
        };

        const adminSession = {
            user: {
                id: 'admin-123',
                email: 'admin@example.com',
                emailVerified: new Date('2024-01-01'),
                isAdmin: true,
            }
        };

        const unverifiedSession = {
            user: {
                id: 'user-456',
                email: 'unverified@example.com',
                emailVerified: null,
                isAdmin: false,
            }
        };

        test('debería retornar usuario autenticado con sesión válida', async () => {
            mockAuth.mockResolvedValue(validSession);

            const result = await getAuthenticatedUser();

            expect(result).toEqual({
                id: 'user-123',
                email: 'test@example.com',
                emailVerified: validSession.user.emailVerified,
                isAdmin: false,
            });
        });

        test('debería lanzar error si no hay sesión', async () => {
            mockAuth.mockResolvedValue(null);

            await expect(getAuthenticatedUser()).rejects.toThrow(UserNotLoggedError);
        });

        test('debería lanzar error si no hay user id', async () => {
            mockAuth.mockResolvedValue({ user: {} });

            await expect(getAuthenticatedUser()).rejects.toThrow(UserNotLoggedError);
        });

        test('debería lanzar error si email no está verificado (por defecto)', async () => {
            mockAuth.mockResolvedValue(unverifiedSession);

            await expect(getAuthenticatedUser()).rejects.toThrow(UserNotLoggedError);
        });

        test('debería permitir email no verificado si requireEmailVerified es false', async () => {
            mockAuth.mockResolvedValue(unverifiedSession);

            const result = await getAuthenticatedUser({ requireEmailVerified: false });

            expect(result.id).toBe('user-456');
        });

        test('debería lanzar error si requiere admin y usuario no es admin', async () => {
            mockAuth.mockResolvedValue(validSession);

            await expect(getAuthenticatedUser({ requireAdmin: true })).rejects.toThrow(UserNotLoggedError);
        });

        test('debería retornar usuario admin cuando se requiere admin', async () => {
            mockAuth.mockResolvedValue(adminSession);

            const result = await getAuthenticatedUser({ requireAdmin: true });

            expect(result.id).toBe('admin-123');
            expect(result.isAdmin).toBe(true);
        });

        test('debería manejar email vacío', async () => {
            mockAuth.mockResolvedValue({
                user: {
                    id: 'user-123',
                    email: null,
                    emailVerified: new Date(),
                    isAdmin: false,
                }
            });

            const result = await getAuthenticatedUser();

            expect(result.email).toBe('');
        });
    });

    describe('withAuth', () => {
        const validSession = {
            user: {
                id: 'user-123',
                email: 'test@example.com',
                emailVerified: new Date('2024-01-01'),
                isAdmin: false,
            }
        };

        test('debería ejecutar función con usuario autenticado', async () => {
            mockAuth.mockResolvedValue(validSession);
            
            const mockFn = jest.fn().mockResolvedValue('resultado');
            const wrappedFn = withAuth(mockFn);

            const result = await wrappedFn();

            expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ id: 'user-123' }));
            expect(result).toBe('resultado');
        });

        test('debería pasar argumentos adicionales a la función', async () => {
            mockAuth.mockResolvedValue(validSession);
            
            const mockFn = jest.fn().mockResolvedValue('resultado');
            const wrappedFn = withAuth(mockFn);

            await wrappedFn('arg1', 123, { key: 'value' });

            expect(mockFn).toHaveBeenCalledWith(
                expect.objectContaining({ id: 'user-123' }),
                'arg1',
                123,
                { key: 'value' }
            );
        });

        test('debería lanzar error si usuario no autenticado', async () => {
            mockAuth.mockResolvedValue(null);
            
            const mockFn = jest.fn();
            const wrappedFn = withAuth(mockFn);

            await expect(wrappedFn()).rejects.toThrow(UserNotLoggedError);
            expect(mockFn).not.toHaveBeenCalled();
        });

        test('debería respetar opciones de autenticación', async () => {
            mockAuth.mockResolvedValue({
                user: {
                    id: 'user-123',
                    email: 'test@example.com',
                    emailVerified: null,
                    isAdmin: false,
                }
            });
            
            const mockFn = jest.fn().mockResolvedValue('ok');
            const wrappedFn = withAuth(mockFn, { requireEmailVerified: false });

            const result = await wrappedFn();

            expect(result).toBe('ok');
        });

        test('debería propagar errores de la función envuelta', async () => {
            mockAuth.mockResolvedValue(validSession);
            
            const mockFn = jest.fn().mockRejectedValue(new Error('Error interno'));
            const wrappedFn = withAuth(mockFn);

            await expect(wrappedFn()).rejects.toThrow('Error interno');
        });

        test('debería preservar el tipo de retorno de la función', async () => {
            mockAuth.mockResolvedValue(validSession);
            
            const mockFn = jest.fn().mockResolvedValue({ data: [1, 2, 3], count: 3 });
            const wrappedFn = withAuth(mockFn);

            const result = await wrappedFn();

            expect(result).toEqual({ data: [1, 2, 3], count: 3 });
        });
    });

    describe('withAdminAuth', () => {
        const adminSession = {
            user: {
                id: 'admin-123',
                email: 'admin@example.com',
                emailVerified: new Date('2024-01-01'),
                isAdmin: true,
            }
        };

        const normalSession = {
            user: {
                id: 'user-123',
                email: 'user@example.com',
                emailVerified: new Date('2024-01-01'),
                isAdmin: false,
            }
        };

        test('debería permitir ejecución para admin', async () => {
            mockAuth.mockResolvedValue(adminSession);
            
            const mockFn = jest.fn().mockResolvedValue('admin result');
            const wrappedFn = withAdminAuth(mockFn);

            const result = await wrappedFn();

            expect(result).toBe('admin result');
        });

        test('debería rechazar usuario no admin', async () => {
            mockAuth.mockResolvedValue(normalSession);
            
            const mockFn = jest.fn();
            const wrappedFn = withAdminAuth(mockFn);

            await expect(wrappedFn()).rejects.toThrow(UserNotLoggedError);
            expect(mockFn).not.toHaveBeenCalled();
        });

        test('debería pasar argumentos correctamente', async () => {
            mockAuth.mockResolvedValue(adminSession);
            
            const mockFn = jest.fn().mockResolvedValue('ok');
            const wrappedFn = withAdminAuth(mockFn);

            await wrappedFn('param1', 'param2');

            expect(mockFn).toHaveBeenCalledWith(
                expect.objectContaining({ id: 'admin-123', isAdmin: true }),
                'param1',
                'param2'
            );
        });
    });

    describe('getOptionalUserId', () => {
        test('debería retornar userId cuando hay sesión', async () => {
            mockAuth.mockResolvedValue({
                user: { id: 'user-123' }
            });

            const result = await getOptionalUserId();

            expect(result).toBe('user-123');
        });

        test('debería retornar null cuando no hay sesión', async () => {
            mockAuth.mockResolvedValue(null);

            const result = await getOptionalUserId();

            expect(result).toBeNull();
        });

        test('debería retornar null cuando sesión no tiene user', async () => {
            mockAuth.mockResolvedValue({});

            const result = await getOptionalUserId();

            expect(result).toBeNull();
        });

        test('debería retornar null cuando user no tiene id', async () => {
            mockAuth.mockResolvedValue({ user: {} });

            const result = await getOptionalUserId();

            expect(result).toBeNull();
        });

        test('debería retornar null si auth lanza error', async () => {
            mockAuth.mockRejectedValue(new Error('Auth error'));

            const result = await getOptionalUserId();

            expect(result).toBeNull();
        });
    });
});
