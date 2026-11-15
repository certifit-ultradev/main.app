import { handleUpload } from '@vercel/blob/client';
import { POST } from './route';
import { getAuthenticatedActor } from '@/infrastructure/auth/authenticated-actor';
import { UserNotLoggedError } from '@/exceptions/user-not-logged';
import { MAX_PROFILE_IMAGE_BYTES } from '@/shared/user-profile-image';

jest.mock('@vercel/blob/client', () => ({ handleUpload: jest.fn() }));
jest.mock('@/infrastructure/auth/authenticated-actor', () => ({ getAuthenticatedActor: jest.fn() }));

const ownPath = '/users/user-1/profile/123e4567-e89b-12d3-a456-426614174000.png';
const request = (pathname: string) => new Request('http://localhost/api/users/me/photo-upload', {
    method: 'POST',
    body: JSON.stringify({
        type: 'blob.generate-client-token',
        payload: { pathname, callbackUrl: 'https://app.example.com/api/users/me/photo-upload', multipart: false, clientPayload: null },
    }),
});

describe('POST /api/users/me/photo-upload', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (getAuthenticatedActor as jest.Mock).mockResolvedValue({ id: 'user-1', isAdmin: false });
        (handleUpload as jest.Mock).mockImplementation(async ({ onBeforeGenerateToken }) => {
            const policy = await onBeforeGenerateToken(ownPath, null, false);
            return { type: 'blob.generate-client-token', clientToken: JSON.stringify(policy) };
        });
    });

    it('issues an image-only, size-limited token for this user', async () => {
        const response = await POST(request(ownPath));
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(JSON.parse(body.clientToken)).toMatchObject({
            allowedContentTypes: ['image/png', 'image/jpeg', 'image/webp'],
            maximumSizeInBytes: MAX_PROFILE_IMAGE_BYTES,
            addRandomSuffix: true,
        });
    });

    it('rejects upload paths belonging to another user', async () => {
        (handleUpload as jest.Mock).mockImplementationOnce(async ({ onBeforeGenerateToken }) => {
            await onBeforeGenerateToken(ownPath.replace('user-1', 'user-2'), null, false);
        });
        const response = await POST(request(ownPath.replace('user-1', 'user-2')));
        expect(response.status).toBe(422);
    });

    it('rejects anonymous users and administrators', async () => {
        (getAuthenticatedActor as jest.Mock).mockRejectedValueOnce(new UserNotLoggedError('test'));
        expect((await POST(request(ownPath))).status).toBe(401);
        (getAuthenticatedActor as jest.Mock).mockResolvedValueOnce({ id: 'admin-1', isAdmin: true });
        expect((await POST(request(ownPath))).status).toBe(403);
    });
});
