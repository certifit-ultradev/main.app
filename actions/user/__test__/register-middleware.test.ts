import { activate, deactivate, edit, register } from '@/actions/user/register';
import { auth } from '@/auth';
import { editUserById, registerUser } from '@/services/user';

jest.mock('@/auth');
jest.mock('@/services/user', () => ({ editUserById: jest.fn(), registerUser: jest.fn() }));

describe('user registration middleware', () => {
    const admin = { id: 'admin', isAdmin: true, emailVerified: new Date() };
    const userInput = {
        name: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        phoneNumber: '573001234567',
        password: 'Password1',
        confirmPassword: 'Password1',
        identification: '123',
        identificationType: 'CC' as const,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (auth as jest.Mock).mockResolvedValue({ user: admin });
        (registerUser as jest.Mock).mockResolvedValue({ id: 'new-user' });
        (editUserById as jest.Mock).mockResolvedValue({ id: 'user-1' });
    });

    it('allows every user administration action for a verified admin', async () => {
        await expect(register(userInput)).resolves.toMatchObject({ ok: true });
        await expect(edit({ ...userInput, id: 'user-1' })).resolves.toMatchObject({ ok: true });
        await expect(activate({ id: 'user-1' })).resolves.toMatchObject({ ok: true });
        await expect(deactivate({ id: 'user-1' })).resolves.toMatchObject({ ok: true });
    });

    it.each([
        ['unverified', { ...admin, emailVerified: null }],
        ['non-admin', { ...admin, isAdmin: false }],
    ])('denies a %s user', async (_label, user) => {
        (auth as jest.Mock).mockResolvedValue({ user });
        await expect(register(userInput)).resolves.toMatchObject({ ok: false });
        expect(registerUser).not.toHaveBeenCalled();
    });

    it('rejects an invalid command before calling a service', async () => {
        const result = await register({ ...userInput, password: 'short', confirmPassword: 'short' });
        expect(result).toMatchObject({ ok: false, error: { code: 'VALIDATION' } });
        expect(registerUser).not.toHaveBeenCalled();
    });

    it('does not mutate an update command while removing password confirmation', async () => {
        const input = { ...userInput, id: 'user-1' };
        await expect(edit(input)).resolves.toMatchObject({ ok: true });
        expect(input.confirmPassword).toBe('Password1');
    });

    it('normalizes an empty identification to null before updating the user', async () => {
        await expect(edit({ ...userInput, id: 'user-1', identification: '  ' })).resolves.toMatchObject({ ok: true });
        expect(editUserById).toHaveBeenCalledWith('user-1', expect.objectContaining({ identification: null }));
    });

    it('rejects an empty required name instead of silently omitting it', async () => {
        await expect(edit({ ...userInput, id: 'user-1', name: '   ' })).resolves.toMatchObject({
            ok: false, error: { code: 'VALIDATION' },
        });
        expect(editUserById).not.toHaveBeenCalled();
    });
});
