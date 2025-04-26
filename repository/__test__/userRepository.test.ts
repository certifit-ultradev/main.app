// usersRepository.test.ts
import { prisma } from '@/lib/prisma';
import {
    findUserByPhoneNumber,
    findUserByEmail,
    findUserById,
    updateUserById,
    createUser,
} from '../users';
import { User } from '@/models/user';
import bcrypt from 'bcryptjs';

jest.mock('../../lib/prisma');

describe("User Repository Tests", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    test('findUserByPhoneNumber debería retornar un usuario si se encuentra', async () => {
        const mockUser = { id: '1', phoneNumber: '123456789' };
        (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

        const result = await findUserByPhoneNumber('123456789');

        expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { phoneNumber: '123456789' } });
        expect(result).toEqual(new User(mockUser));
    });

    test('findUserByPhoneNumber debería retornar null si no se encuentra el usuario', async () => {
        (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

        const result = await findUserByPhoneNumber('987654321');

        expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { phoneNumber: '987654321' } });
        expect(result).toBeNull();
    });

    test('findUserByPhoneNumber debería manejar excepciones', async () => {
        (prisma.user.findFirst as jest.Mock).mockRejectedValue(new Error('Error de base de datos'));

        await expect(findUserByPhoneNumber('123456789')).rejects.toThrow('Error de base de datos');
    });

    test('findUserByEmail debería retornar un usuario si se encuentra', async () => {
        const mockUser = { id: '1', email: 'test@example.com' };
        (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

        const result = await findUserByEmail('test@example.com');

        expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
        expect(result).toEqual(new User(mockUser));
    });

    test('findUserById debería retornar un usuario si se encuentra', async () => {
        const mockUser = { id: '1' };
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

        const result = await findUserById('1');

        expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
        expect(result).toEqual(new User(mockUser));
    });

    test('updateUserById debería actualizar el usuario correctamente', async () => {
        const mockUser = { id: '1', name: 'John Doe' };
        (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

        const result = await updateUserById('1', { name: 'John Doe' });

        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { id: '1' },
            data: { name: 'John Doe' },
        });
        expect(result).toEqual(mockUser);
    });

    test('updateUserById debería manejar excepciones', async () => {
        (prisma.user.update as jest.Mock).mockRejectedValue(new Error('Error de actualización'));

        await expect(updateUserById('1', { name: 'John Doe' })).rejects.toThrow('Error de actualización');
    });

    test('createUser debería crear un usuario correctamente', async () => {
        const mockUserInput = new User({
            email: 'test@example.com',
            password: 'password123',
        });
        const hashedPassword = 'hashedpassword123';

        jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);
        (prisma.user.create as jest.Mock).mockResolvedValue({
            id: '1',
            email: 'test@example.com',
            password: hashedPassword,
        });

        const result = await createUser(mockUserInput);

        expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
        expect(prisma.user.create).toHaveBeenCalledWith({
            data: {
                email: 'test@example.com',
                password: hashedPassword,
            },
        });
        expect(result).toEqual({
            id: '1',
            email: 'test@example.com',
            password: hashedPassword,
        });
    });

    test('createUser debería manejar excepciones', async () => {
        const mockUserInput = new User({
            email: 'test@example.com',
            password: 'password123',
        });

        jest.spyOn(bcrypt, 'hash').mockRejectedValue(new Error('Error al hashear contraseña'));

        await expect(createUser(mockUserInput)).rejects.toThrow('Error al hashear contraseña');
    });
})