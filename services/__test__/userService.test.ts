import * as userRepository from '@/repository/users';
import { getUserByEmail, getUserById, getUserByPhoneNumber, registerUser } from '../user';
import { User } from '../../models/user';
import { RegisterUser } from '@/utils/types';
import { Prisma } from '@prisma/client';

jest.mock('../../repository/users');

const { findUserByEmail, createUser, findUserById, findUserByPhoneNumber } = userRepository;

const mockRegisterUser: RegisterUser = {
    name: 'John',
    lastName: 'Doe',
    password: 'securepassword',
    email: 'john.doe@example.com',
    phoneNumber: '123456789',
    confirmPassword: 'securepassword',
    checkTerms: true
};

describe('User Service Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('getUserByEmail debería retornar un usuario si se encuentra', async () => {
        const mockUser = new User({ email: 'test@example.com' });
        (findUserByEmail as jest.Mock).mockResolvedValue(mockUser);

        const result = await getUserByEmail('test@example.com');

        expect(findUserByEmail).toHaveBeenCalledWith('test@example.com');
        expect(result).toEqual(mockUser);
    });

    test('getUserByEmail debería retornar null si no se encuentra el usuario', async () => {
        (findUserByEmail as jest.Mock).mockResolvedValue(null);

        const result = await getUserByEmail('nonexistent@example.com');

        expect(findUserByEmail).toHaveBeenCalledWith('nonexistent@example.com');
        expect(result).toBeNull();
    });

    test('getUserByEmail debería manejar excepciones y retornar null', async () => {
        (findUserByEmail as jest.Mock).mockRejectedValue(new Error('Error de base de datos'));

        const result = await getUserByEmail('error@example.com');

        expect(findUserByEmail).toHaveBeenCalledWith('error@example.com');
        expect(result).toBeNull();
    });

    test('getUserByPhoneNumber debería retornar un usuario si se encuentra', async () => {
        const mockUser = new User({ phoneNumber: '123456789' });
        (findUserByPhoneNumber as jest.Mock).mockResolvedValue(mockUser);

        const result = await getUserByPhoneNumber('123456789');

        expect(findUserByPhoneNumber).toHaveBeenCalledWith('123456789');
        expect(result).toEqual(mockUser);
    });

    test('getUserByPhoneNumber debería retornar null si no se encuentra el usuario', async () => {
        (findUserByPhoneNumber as jest.Mock).mockResolvedValue(null);

        const result = await getUserByPhoneNumber('987654321');

        expect(findUserByPhoneNumber).toHaveBeenCalledWith('987654321');
        expect(result).toBeNull();
    });

    test('getUserByPhoneNumber debería manejar excepciones y retornar null', async () => {
        (findUserByPhoneNumber as jest.Mock).mockRejectedValue(new Error('Error de base de datos'));

        const result = await getUserByPhoneNumber('error_number');

        expect(findUserByPhoneNumber).toHaveBeenCalledWith('error_number');
        expect(result).toBeNull();
    });

    test('getUserById debería retornar un usuario si se encuentra', async () => {
        const mockUser = new User({ id: 'user123' });
        (findUserById as jest.Mock).mockResolvedValue(mockUser);

        const result = await getUserById('user123');

        expect(findUserById).toHaveBeenCalledWith('user123');
        expect(result).toEqual(mockUser);
    });

    test('getUserById debería retornar null si no se encuentra el usuario', async () => {
        (findUserById as jest.Mock).mockResolvedValue(null);

        const result = await getUserById('nonexistent_id');

        expect(findUserById).toHaveBeenCalledWith('nonexistent_id');
        expect(result).toBeNull();
    });

    test('getUserById debería manejar excepciones y retornar null', async () => {
        (findUserById as jest.Mock).mockRejectedValue(new Error('Error de base de datos'));

        const result = await getUserById('error_id');

        expect(findUserById).toHaveBeenCalledWith('error_id');
        expect(result).toBeNull();
    });

    test('registerUser debería registrar un usuario correctamente', async () => {
        const mockUser = new User({
            ...mockRegisterUser,
            emailVerified: true,
        });

        (createUser as jest.Mock).mockResolvedValue(mockUser);

        const result = await registerUser(mockRegisterUser);

        expect(createUser).toHaveBeenCalledWith(expect.any(User));
        expect(result).toEqual(mockUser);
    });

    test('registerUser debería manejar error de correo electrónico ya en uso', async () => {
        const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
            code: 'P2002',
            clientVersion: '3.0.0',
        });

        (createUser as jest.Mock).mockRejectedValue(prismaError);

        const result = await registerUser(mockRegisterUser);

        expect(createUser).toHaveBeenCalledWith(expect.any(User));
        expect(result).toBeNull();
    });

    test('registerUser debería manejar errores de validación de Prisma', async () => {
        const validationError = new Prisma.PrismaClientValidationError('Validation error', {
            clientVersion: '3.0.0',
        });

        (createUser as jest.Mock).mockRejectedValue(validationError);

        const result = await registerUser(mockRegisterUser);

        expect(createUser).toHaveBeenCalledWith(expect.any(User));
        expect(result).toBeNull();
    });

    test('registerUser debería manejar otros errores desconocidos', async () => {
        const unknownError = new Error('Unknown error');

        (createUser as jest.Mock).mockRejectedValue(unknownError);

        const result = await registerUser(mockRegisterUser);

        expect(createUser).toHaveBeenCalledWith(expect.any(User));
        expect(result).toBeNull();
    });

    test('registerUser debería manejar otros errores desconocidos', async () => {
        const unknownError = new Error('Unknown error');

        (createUser as jest.Mock).mockRejectedValue(unknownError);

        const result = await registerUser(mockRegisterUser);

        expect(createUser).toHaveBeenCalledWith(expect.any(User));
        expect(result).toBeNull();
    });
});