import { fetchUserByEmail, fetchUserById } from '@/actions/user/exist';
import { auth } from '@/auth';
import { getAdminUserById, userExistsByEmail } from '@/services/user';

jest.mock('@/auth');
jest.mock('@/services/user', () => ({
    getAdminUserById: jest.fn(),
    userExistsByEmail: jest.fn(),
}));

describe('existAction', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (auth as jest.Mock).mockResolvedValue({ user: { id: 'admin-1', isAdmin: true, emailVerified: new Date() } });
    });

    it('returns a conflict only when an email exists', async () => {
        (userExistsByEmail as jest.Mock).mockResolvedValue(false);
        await expect(fetchUserByEmail({ email: 'available@example.com' })).resolves.toMatchObject({ ok: true });

        (userExistsByEmail as jest.Mock).mockResolvedValue(true);
        await expect(fetchUserByEmail({ email: 'used@example.com' })).resolves.toMatchObject({
            ok: false,
            error: { code: 'CONFLICT' },
        });
    });

    it('returns the administrative DTO without credentials', async () => {
        (getAdminUserById as jest.Mock).mockResolvedValue({
            id: 'user-1',
            name: 'Ada',
            lastName: 'Lovelace',
            email: 'ada@example.com',
            phoneNumber: '573001234567',
            isAdmin: false,
            emailVerified: null,
            identification: null,
            identificationType: null,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
        });

        const result = await fetchUserById({ id: 'user-1' });

        expect(result).toMatchObject({ ok: true });
        if (result.ok) expect(result.data).not.toHaveProperty('password');
    });
});
