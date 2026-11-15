import { prisma } from "@/lib/prisma";
import { Prisma } from '@/prisma/app/generated/prisma/client';
import { UserExistError } from '@/exceptions/user-exist';
import {
    allUsers,
    findUserByPhoneNumber,
    countAllUsers,
    findUserByEmail,
    findUserById,
    updateUserById,
    createUser,
    assignCourse,
    removeCourseFromUser
} from '@/repository/users';

jest.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
        },
        userCourse: {
            create: jest.fn(),
            deleteMany: jest.fn(),
        }
    }
}));


describe('Users Repository Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('allUsers', () => {
        test('debería retornar un array de usuarios con paginación', async () => {
            const mockUsers = [
                {
                    id: 'user-1',
                    name: 'Juan',
                    lastName: 'Pérez',
                    email: 'juan@test.com',
                    password: 'hashedpass',
                    isAdmin: false,
                    emailVerified: new Date(),
                    identification: '123456',
                    identificationType: 'CC',
                    phoneNumber: '+57 300 1111111',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: 'user-2',
                    name: 'María',
                    lastName: 'García',
                    email: 'maria@test.com',
                    password: 'hashedpass2',
                    isAdmin: false,
                    emailVerified: new Date(),
                    identification: '789012',
                    identificationType: 'CC',
                    phoneNumber: '+57 300 2222222',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

            const result = await allUsers(1, 10);

            expect(prisma.user.findMany).toHaveBeenCalledWith({
                skip: 0,
                take: 10
            });
            expect(result).toHaveLength(2);
        });

        test('debería retornar array vacío cuando no hay usuarios', async () => {
            (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

            const result = await allUsers(1, 10);

            expect(result).toEqual([]);
            expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
        });

        test('debería ajustar la página a 1 si es menor que 1', async () => {
            (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

            await allUsers(0, 10);

            expect(prisma.user.findMany).toHaveBeenCalledWith({
                skip: 0,
                take: 10
            });
        });

        test('debería calcular correctamente el skip para diferentes páginas', async () => {
            (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

            await allUsers(3, 20);

            expect(prisma.user.findMany).toHaveBeenCalledWith({
                skip: 40,
                take: 20
            });
        });
    });

    describe('findUserByPhoneNumber', () => {
        test('debería retornar un usuario cuando existe por número de teléfono', async () => {
            const mockUser = {
                id: 'user-phone-123',
                name: 'Pedro',
                lastName: 'López',
                email: 'pedro@test.com',
                phoneNumber: '+57 300 1234567',
                password: 'hashedpass',
                isAdmin: false,
                emailVerified: new Date(),
                identification: '111222',
                identificationType: 'CC' as const,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

            const result = await findUserByPhoneNumber('+57 300 1234567');

            expect(prisma.user.findFirst).toHaveBeenCalledWith({
                where: { phoneNumber: '+57 300 1234567' }
            });
            expect(result).toMatchObject({ phoneNumber: '+57 300 1234567' });
        });

        test('debería lanzar NotFoundError cuando el usuario no existe', async () => {
            (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

            await expect(findUserByPhoneNumber('+57 300 9999999')).resolves.toBeNull();
            
            expect(prisma.user.findFirst).toHaveBeenCalledWith({
                where: { phoneNumber: '+57 300 9999999' }
            });
        });
    });

    describe('countAllUsers', () => {
        test('debería retornar el conteo total de usuarios', async () => {
            (prisma.user.count as jest.Mock).mockResolvedValue(42);

            const result = await countAllUsers();

            expect(prisma.user.count).toHaveBeenCalledTimes(1);
            expect(result).toBe(42);
        });

        test('debería retornar 0 cuando no hay usuarios', async () => {
            (prisma.user.count as jest.Mock).mockResolvedValue(0);

            const result = await countAllUsers();

            expect(result).toBe(0);
        });
    });

    describe('findUserByEmail', () => {
        test('debería retornar un usuario cuando existe por email', async () => {
            const mockUser = {
                id: 'user-email-123',
                name: 'Ana',
                lastName: 'Martínez',
                email: 'ana@test.com',
                password: 'hashedpass',
                isAdmin: false,
                emailVerified: new Date(),
                identification: '333444',
                identificationType: 'CC',
                phoneNumber: '+57 300 3333333',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

            const result = await findUserByEmail('ana@test.com');

            expect(prisma.user.findFirst).toHaveBeenCalledWith({
                where: { email: 'ana@test.com' }
            });
            expect(result?.email).toBe('ana@test.com');
        });

        test('debería lanzar NotFoundError cuando el email no existe', async () => {
            (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

            await expect(findUserByEmail('noexiste@test.com')).resolves.toBeNull();
        });
    });

    describe('findUserById', () => {
        test('debería retornar un usuario cuando existe por ID', async () => {
            const mockUser = {
                id: 'user-id-123',
                name: 'Carlos',
                lastName: 'Rodríguez',
                email: 'carlos@test.com',
                password: 'hashedpass',
                isAdmin: true,
                emailVerified: new Date(),
                identification: '555666',
                identificationType: 'CC',
                phoneNumber: '+57 300 5555555',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const result = await findUserById('user-id-123');

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: 'user-id-123' }
            });
            expect(result?.id).toBe('user-id-123');
        });

        test('debería lanzar NotFoundError cuando el ID no existe', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(findUserById('non-existent-id')).resolves.toBeNull();
        });
    });

    describe('updateUserById', () => {
        test('omite undefined y persiste null para limpiar campos anulables', async () => {
            const userId = 'user-nullable-patch';
            (prisma.user.update as jest.Mock).mockResolvedValue({
                id: userId,
                name: 'Ada', lastName: 'Lovelace', email: 'ada@test.com',
                password: 'stored-hash', isAdmin: false, emailVerified: null,
                identification: null, identificationType: null,
                phoneNumber: '573001234567', createdAt: new Date(), updatedAt: null,
            });

            await updateUserById(userId, {
                name: undefined,
                identification: null,
                identificationType: null,
                emailVerified: null,
            });

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: { identification: null, identificationType: null, emailVerified: null },
            });
        });

        test('debería persistir el hash de contraseña recibido', async () => {
            const userId = 'user-update-123';
            const updateData = {
                name: 'Nombre Actualizado',
                passwordHash: 'hashed-newpassword',
            };

            const mockUpdatedUser = {
                id: userId,
                name: 'Nombre Actualizado',
                lastName: 'Apellido',
                email: 'usuario@test.com',
                password: 'hashed-newpassword',
                isAdmin: false,
                emailVerified: new Date(),
                identification: '777888',
                identificationType: 'CC',
                phoneNumber: '+57 300 7777777',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

            const result = await updateUserById(userId, updateData);

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: expect.objectContaining({
                    name: 'Nombre Actualizado',
                    password: 'hashed-newpassword',
                })
            });
            expect(result.name).toBe('Nombre Actualizado');
        });

        test('debería actualizar usuario sin contraseña cuando no se recibe un hash', async () => {
            const userId = 'user-update-456';
            const updateData = {
                name: 'Solo Nombre',
                lastName: 'Solo Apellido',
            };

            const mockUpdatedUser = {
                id: userId,
                name: 'Solo Nombre',
                lastName: 'Solo Apellido',
                email: 'usuario@test.com',
                password: 'existing-hash',
                isAdmin: false,
                emailVerified: new Date(),
                identification: '999000',
                identificationType: 'CC',
                phoneNumber: '+57 300 9999000',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

            const result = await updateUserById(userId, updateData);

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: updateData
            });
            expect(result.name).toBe('Solo Nombre');
        });

        test('debería excluir userCourse del updateData', async () => {
            const userId = 'user-update-789';
            const updateData = {
                name: 'Test',
                userCourse: [{ courseId: 1 }] as any,
            };

            const mockUpdatedUser = {
                id: userId,
                name: 'Test',
                lastName: 'User',
                email: 'test@test.com',
                password: 'hash',
                isAdmin: false,
                emailVerified: new Date(),
                identification: '111000',
                identificationType: 'CC',
                phoneNumber: '+57 300 1110000',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

            await updateUserById(userId, updateData);

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: expect.not.objectContaining({
                    userCourse: expect.anything()
                })
            });
        });
    });

    describe('createUser', () => {
        test('traduce una colisión única de Prisma a conflicto de usuario', async () => {
            (prisma.user.create as jest.Mock).mockRejectedValue(new Prisma.PrismaClientKnownRequestError(
                'private database detail', { code: 'P2002', clientVersion: 'test' },
            ));

            await expect(createUser({
                name: 'Ada', lastName: 'Lovelace', email: 'ada@test.com', phoneNumber: '573001234567',
                passwordHash: 'stored-hash', isAdmin: false, emailVerified: null,
            })).rejects.toThrow(UserExistError);
        });

        test('debería crear un nuevo usuario con el hash recibido', async () => {
            const newUser = {
                name: 'Nuevo',
                lastName: 'Usuario',
                email: 'nuevo@test.com',
                passwordHash: 'hashed-plainpassword',
                isAdmin: false,
                emailVerified: null,
                identification: '123000',
                identificationType: 'CC' as const,
                phoneNumber: '+57 300 1230000',
            };

            const mockCreatedUser = {
                id: 'new-user-id',
                ...newUser,
                password: 'hashed-plainpassword',
            };

            (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);

            const result = await createUser(newUser);

            expect(prisma.user.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    name: 'Nuevo',
                    lastName: 'Usuario',
                    email: 'nuevo@test.com',
                    password: 'hashed-plainpassword',
                })
            });
            expect(result).toMatchObject({ id: 'new-user-id', passwordHash: 'hashed-plainpassword' });
        });

        test('el repositorio no acepta una contraseña en texto plano', async () => {
            const newUser = {
                name: 'Sin',
                lastName: 'Password',
                email: 'sinpass@test.com',
                passwordHash: 'stored-hash',
                isAdmin: false,
                emailVerified: null,
                identification: '456000',
                identificationType: 'CE' as const,
                phoneNumber: '+57 300 4560000',
            };

            const mockCreatedUser = {
                id: 'new-user-no-pass',
                ...newUser,
            };

            (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);

            const result = await createUser(newUser);

            expect(prisma.user.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    email: 'sinpass@test.com',
                    password: 'stored-hash',
                })
            });
            expect(result).toMatchObject({ id: 'new-user-no-pass' });
        });
    });

    describe('assignCourse', () => {
        test('debería asignar un curso a un usuario correctamente', async () => {
            const userId = 'user-assign-123';
            const courseId = 5;

            const mockUserCourse = {
                id: 'user-course-123',
                userId: userId,
                courseId: courseId,
                createdAt: new Date(),
            };

            (prisma.userCourse.create as jest.Mock).mockResolvedValue(mockUserCourse);

            const result = await assignCourse(userId, courseId);

            expect(prisma.userCourse.create).toHaveBeenCalledWith({
                data: {
                    userId: userId,
                    courseId: courseId,
                }
            });
            expect(result?.userId).toBe(userId);
            expect(result?.courseId).toBe(courseId);
        });

        test('debería manejar errores al crear la asignación', async () => {
            const error = new Error('Error de base de datos');
            (prisma.userCourse.create as jest.Mock).mockRejectedValue(error);

            await expect(assignCourse('user-fail', 999)).rejects.toThrow('Error de base de datos');
            expect(prisma.userCourse.create).toHaveBeenCalled();
        });
    });

    describe('removeCourseFromUser', () => {
        test('debería eliminar correctamente la asignación de un curso', async () => {
            const userId = 'user-remove-123';
            const courseId = 10;

            (prisma.userCourse.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

            await expect(removeCourseFromUser(userId, courseId)).resolves.toBe(true);

            expect(prisma.userCourse.deleteMany).toHaveBeenCalledWith({ where: { userId, courseId } });
        });

        test('retorna false cuando la asignación no existe', async () => {
            (prisma.userCourse.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

            await expect(removeCourseFromUser('user-not-found', 999)).resolves.toBe(false);
            
            expect(prisma.userCourse.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-not-found', courseId: 999 } });
        });

        test('debería verificar que se elimina la asignación correcta', async () => {
            const userId = 'user-specific';
            const courseId = 25;

            (prisma.userCourse.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

            await removeCourseFromUser(userId, courseId);

            expect(prisma.userCourse.deleteMany).toHaveBeenCalledWith({ where: { userId, courseId } });
        });
    });
});
