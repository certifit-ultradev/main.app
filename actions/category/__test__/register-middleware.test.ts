import { deleteCategory, edit, register } from '@/actions/category/register';
import { auth } from '@/auth';
import { changeCourseCategory, registerCourseCategory, removeCourseCategory } from '@/services/categories';

jest.mock('@/auth');
jest.mock('@/services/categories');

describe('category mutation actions', () => {
    const admin = { id: 'admin', isAdmin: true, emailVerified: new Date() };

    beforeEach(() => {
        jest.clearAllMocks();
        (auth as jest.Mock).mockResolvedValue({ user: admin });
        (registerCourseCategory as jest.Mock).mockResolvedValue({ id: 1, name: 'Web' });
        (changeCourseCategory as jest.Mock).mockResolvedValue({ id: 1, name: 'Updated' });
        (removeCourseCategory as jest.Mock).mockResolvedValue(undefined);
    });

    it('allows every category mutation for a verified admin', async () => {
        await expect(register({ name: 'Web' })).resolves.toMatchObject({ ok: true });
        await expect(edit({ id: 1, name: 'Updated' })).resolves.toMatchObject({ ok: true });
        await expect(deleteCategory({ id: 1 })).resolves.toMatchObject({ ok: true });
    });

    it.each([
        ['unverified', { ...admin, emailVerified: null }],
        ['non-admin', { ...admin, isAdmin: false }],
    ])('denies a %s user', async (_label, user) => {
        (auth as jest.Mock).mockResolvedValue({ user });
        await expect(register({ name: 'Web' })).resolves.toMatchObject({ ok: false });
        expect(registerCourseCategory).not.toHaveBeenCalled();
    });

    it('rejects an invalid command before calling a service', async () => {
        const result = await register({ name: 'x' });
        expect(result).toMatchObject({ ok: false, error: { code: 'VALIDATION' } });
        expect(registerCourseCategory).not.toHaveBeenCalled();
    });
});
