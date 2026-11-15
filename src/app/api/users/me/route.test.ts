import { GET, PATCH } from './route';
import { getAuthenticatedActor } from '@/infrastructure/auth/authenticated-actor';
import { getClientProfile, editClientProfile } from '@/services/client-profile';
import { UserNotLoggedError } from '@/exceptions/user-not-logged';

jest.mock('@/infrastructure/auth/authenticated-actor', () => ({ getAuthenticatedActor: jest.fn() }));
jest.mock('@/services/client-profile', () => ({ getClientProfile: jest.fn(), editClientProfile: jest.fn() }));

const profile = {
    id: 'user-1', name: 'Pablo', lastName: 'Lozano', email: 'pablo@example.com',
    phoneNumber: '573001234567', profileImage: null, identification: null,
    identificationType: null, createdAt: '2026-01-01T00:00:00.000Z',
};

const patchRequest = (value: unknown) => new Request('http://localhost/api/users/me', {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value),
});

describe('/api/users/me', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (getAuthenticatedActor as jest.Mock).mockResolvedValue({ id: 'user-1', isAdmin: false });
        (getClientProfile as jest.Mock).mockResolvedValue(profile);
        (editClientProfile as jest.Mock).mockResolvedValue(profile);
    });

    it('reads only the authenticated client profile without credential fields', async () => {
        const response = await GET();
        expect(response.status).toBe(200);
        expect(response.headers.get('Cache-Control')).toBe('private, no-store');
        expect(getClientProfile).toHaveBeenCalledWith('user-1');
        const body = await response.json();
        expect(body.data).toEqual(profile);
        expect(JSON.stringify(body)).not.toMatch(/password|isAdmin/);
    });

    it('updates only the authenticated account', async () => {
        const response = await PATCH(patchRequest({ name: 'Paulo', phoneNumber: '573009876543' }));
        expect(response.status).toBe(200);
        expect(editClientProfile).toHaveBeenCalledWith('user-1', { name: 'Paulo', phoneNumber: '573009876543' });
    });

    it.each([{ id: 'other-user' }, { email: 'new@example.com' }, { password: 'Password1' }, { isAdmin: true }])(
        'rejects a forbidden field in the client patch', async (extra) => {
            const response = await PATCH(patchRequest({ name: 'Paulo', ...extra }));
            expect(response.status).toBe(422);
            expect(editClientProfile).not.toHaveBeenCalled();
        },
    );

    it('rejects administrators and anonymous callers', async () => {
        (getAuthenticatedActor as jest.Mock).mockResolvedValueOnce({ id: 'admin-1', isAdmin: true });
        expect((await GET()).status).toBe(403);
        (getAuthenticatedActor as jest.Mock).mockRejectedValueOnce(new UserNotLoggedError('test'));
        expect((await PATCH(patchRequest({ name: 'Paulo' }))).status).toBe(401);
        expect(editClientProfile).not.toHaveBeenCalled();
    });
});
