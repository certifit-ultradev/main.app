// login.test.ts
import { signOut } from '@/auth';
import { logout } from '../logout';

jest.mock('@/auth');
jest.mock('next-auth');
jest.mock('@auth/prisma-adapter');
jest.mock('@/lib/prisma');
jest.mock('@auth/core/providers/credentials');

const mockCallbackUrl = '/login';

describe("Logout Action Tests", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Debería cerrar sesión exitosamente', async () => {
        (signOut as jest.Mock).mockResolvedValue(undefined);

        const result = await logout();

        expect(signOut).toHaveBeenCalledWith({
            redirectTo: mockCallbackUrl,
        });

        expect({
            success: true,
            message: 'Ha cerrado sesión correctamente!',
        }).toEqual(result);
    });

    test('Debería manejar cualquier error y retornar el mensaje de error adecuado', async () => {
        const authError = new Error('Some Error');
        (signOut as jest.Mock).mockRejectedValue(authError);
        const result = await logout();
        expect({
            success: false,
            error: 'Algo ha pasado, intenta mas tarde!',
        }).toEqual(result);
    });
});