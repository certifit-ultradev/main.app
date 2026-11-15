import { editUserById, listAdminUsers, registerUser } from '@/services/user';
import { allUsers, countAllUsers, createUser, updateUserById } from '@/repository/users';
import { bcryptPasswordHasher } from '@/infrastructure/identity/bcrypt-password-hasher';

jest.mock('@/repository/users', () => ({
    allUsers: jest.fn(),
    countAllUsers: jest.fn(),
    createUser: jest.fn(),
    updateUserById: jest.fn(),
}));
jest.mock('@/infrastructure/identity/bcrypt-password-hasher', () => ({
    bcryptPasswordHasher: { hash: jest.fn() },
}));
jest.mock('@/utils/service-wrapper', () => ({ executeService: (operation: () => unknown) => operation() }));

describe('user credential service boundary', () => {
    beforeEach(() => jest.clearAllMocks());

    it('hashes a registration password before invoking the repository', async () => {
        (bcryptPasswordHasher.hash as jest.Mock).mockResolvedValue('stored-password-hash');
        (createUser as jest.Mock).mockResolvedValue({ id: 'user-1' });

        await registerUser({
            name: 'Ada',
            lastName: 'Lovelace',
            email: 'ada@example.com',
            phoneNumber: '573001234567',
            password: 'Password1',
            identification: '123',
            identificationType: 'CC',
        });

        expect(bcryptPasswordHasher.hash).toHaveBeenCalledWith('Password1');
        expect(createUser).toHaveBeenCalledWith(expect.objectContaining({
            passwordHash: 'stored-password-hash',
        }));
        expect((createUser as jest.Mock).mock.calls[0][0]).not.toHaveProperty('password');
    });

    it('hashes a password patch before invoking the repository', async () => {
        (bcryptPasswordHasher.hash as jest.Mock).mockResolvedValue('updated-password-hash');
        (updateUserById as jest.Mock).mockResolvedValue({ id: 'user-1' });

        await editUserById('user-1', { name: 'Ada Byron', password: 'Password2' });

        expect(bcryptPasswordHasher.hash).toHaveBeenCalledWith('Password2');
        expect(updateUserById).toHaveBeenCalledWith('user-1', {
            name: 'Ada Byron',
            passwordHash: 'updated-password-hash',
        });
    });

    it('serializes administrative users without password credentials', async () => {
        (allUsers as jest.Mock).mockResolvedValue([{
            id: 'user-1', name: 'Ada', lastName: 'Lovelace', email: 'ada@example.com',
            phoneNumber: '573001234567', isAdmin: false, password: 'stored-password-hash',
            emailVerified: null, identification: null, identificationType: null,
            createdAt: new Date('2025-01-01'), updatedAt: null,
        }]);
        (countAllUsers as jest.Mock).mockResolvedValue(1);

        const result = await listAdminUsers({ page: 1 });
        const serialized = JSON.stringify(result);

        expect(serialized).not.toContain('stored-password-hash');
        expect(serialized).not.toMatch(/"password"/);
        expect(result.data[0]).toMatchObject({ id: 'user-1', email: 'ada@example.com' });
    });

    it('rejects an invalid persisted identification type instead of casting it into a public DTO', async () => {
        (allUsers as jest.Mock).mockResolvedValue([{
            id: 'user-1', name: 'Ada', lastName: 'Lovelace', email: 'ada@example.com',
            phoneNumber: '573001234567', isAdmin: false, passwordHash: null,
            emailVerified: null, identification: null, identificationType: 'INVALID',
            createdAt: new Date('2025-01-01'), updatedAt: null,
        }]);
        (countAllUsers as jest.Mock).mockResolvedValue(1);

        await expect(listAdminUsers({ page: 1 })).rejects.toThrow('tipo de identificación inválido');
    });
});
