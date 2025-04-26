// login.test.ts
import { login } from '../login';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';
import { LoginForm } from '@/utils/types';

jest.mock('@/auth');
jest.mock('next-auth');

const mockLoginForm: LoginForm = {
    email: 'test@example.com',
    password: 'password123',
};

const mockCallbackUrl = '/dashboard';

describe("Login Action Tests", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Debería iniciar sesión exitosamente', async () => {
        (signIn as jest.Mock).mockResolvedValue(undefined);

        const result = await login(mockLoginForm, mockCallbackUrl);

        expect(signIn).toHaveBeenCalledWith('credentials', {
            email: mockLoginForm.email,
            password: mockLoginForm.password,
            redirectTo: mockCallbackUrl || DEFAULT_LOGIN_REDIRECT,
        });

        expect({
            success: true,
            message: 'Ha iniciado sesión correctamente!',
        }).toEqual(result);
    });

    test('Debería manejar AuthError y retornar el mensaje de error adecuado', async () => {
        const authError = new AuthError('Credenciales inválidas');
        (signIn as jest.Mock).mockRejectedValue(authError);

        const result = await login(mockLoginForm, mockCallbackUrl);

        expect(signIn).toHaveBeenCalledWith('credentials', {
            email: mockLoginForm.email,
            password: mockLoginForm.password,
            redirectTo: mockCallbackUrl || DEFAULT_LOGIN_REDIRECT,
        });

        expect({
            success: false,
            error: 'Algo ha pasado, intenta mas tarde!',
        }).toEqual(result);
    });

    test('Debería lanzar el error si no es una instancia de AuthError', async () => {
        const unknownError = new Error('Error desconocido');
        (signIn as jest.Mock).mockRejectedValue(unknownError);

        await expect(login(mockLoginForm, mockCallbackUrl)).rejects.toThrow('Error desconocido');

        expect(signIn).toHaveBeenCalledWith('credentials', {
            email: mockLoginForm.email,
            password: mockLoginForm.password,
            redirectTo: mockCallbackUrl || DEFAULT_LOGIN_REDIRECT,
        });
    });
});