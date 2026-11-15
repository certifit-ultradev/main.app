import { GET } from '@/src/app/api/courses/top-three/route';
import { getCatalogCourses } from '@/services/courses';
import { UserNotLoggedError } from '@/exceptions/user-not-logged';

jest.mock('@/services/courses', () => ({ getCatalogCourses: jest.fn() }));

describe('GET /api/courses/top-three', () => {
    beforeEach(() => jest.clearAllMocks());

    it('wraps catalog data and an empty collection without adding errors', async () => {
        const catalog = [{ id: 1, canonicalId: 'course-1', title: 'Curso' }];
        (getCatalogCourses as jest.Mock).mockResolvedValueOnce(catalog).mockResolvedValueOnce([]);

        await expect((await GET()).json()).resolves.toEqual({ data: catalog });
        await expect((await GET()).json()).resolves.toEqual({ data: [] });
    });

    it('returns the public error shape on failure', async () => {
        (getCatalogCourses as jest.Mock).mockRejectedValue(new UserNotLoggedError('private@example.com'));

        const response = await GET();
        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toEqual({
            error: { code: 'UNAUTHENTICATED', message: 'No tienes una sesión válida para esta operación.' },
        });
    });
});
