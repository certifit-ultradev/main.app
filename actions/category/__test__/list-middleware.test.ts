import { fetchCategoryById, listAllCourseCategories } from '@/actions/category/list';
import { auth } from '@/auth';
import { getAllCourseCategories, getCategoryById } from '@/services/categories';

jest.mock('@/auth');
jest.mock('@/services/categories');

describe('category actions', () => {
    beforeEach(() => jest.clearAllMocks());

    it('allows a verified admin', async () => {
        (auth as jest.Mock).mockResolvedValue({ user: { id: 'admin', isAdmin: true, emailVerified: new Date() } });
        (getAllCourseCategories as jest.Mock).mockResolvedValue([{ id: 1, name: 'Web' }]);
        (getCategoryById as jest.Mock).mockResolvedValue({ id: 1, name: 'Web' });

        await expect(listAllCourseCategories()).resolves.toEqual({ ok: true, data: [{ id: 1, name: 'Web' }] });
        await expect(fetchCategoryById({ id: 1 })).resolves.toEqual({ ok: true, data: { id: 1, name: 'Web' } });
    });

    it.each([
        ['an unauthenticated visitor', null, 'UNAUTHENTICATED'],
        ['an unverified admin', { id: 'admin', isAdmin: true, emailVerified: null }, 'EMAIL_UNVERIFIED'],
        ['a non-admin', { id: 'user', isAdmin: false, emailVerified: new Date() }, 'FORBIDDEN'],
    ])('denies %s', async (_label, user, expectedCode) => {
        (auth as jest.Mock).mockResolvedValue({ user });
        if (user === null) (auth as jest.Mock).mockResolvedValue(null);

        const result = await listAllCourseCategories();
        expect(result).toMatchObject({ ok: false, error: { code: expectedCode } });
        expect(getAllCourseCategories).not.toHaveBeenCalled();
    });
});
