import { head, del } from '@vercel/blob';
import { assertOwnedProfileImage, removeOldProfileImage } from '@/infrastructure/blob/profile-image';
import { isOwnedProfileImagePath, isOwnedProfileImageUrl, MAX_PROFILE_IMAGE_BYTES } from '@/shared/user-profile-image';

jest.mock('@vercel/blob', () => ({ head: jest.fn(), del: jest.fn() }));

const path = '/users/user-1/profile/123e4567-e89b-12d3-a456-426614174000-random.png';
const url = `https://store123.public.blob.vercel-storage.com${path}`;

describe('profile image ownership', () => {
    beforeEach(() => jest.clearAllMocks());

    it('accepts only the current user path on the Blob host', () => {
        expect(isOwnedProfileImagePath(path, 'user-1')).toBe(true);
        expect(isOwnedProfileImagePath(path, 'user-2')).toBe(false);
        expect(isOwnedProfileImageUrl(url, 'user-1')).toBe(true);
        expect(isOwnedProfileImageUrl(`https://other.example.com${path}`, 'user-1')).toBe(false);
        expect(isOwnedProfileImageUrl(`${url}?key=1`, 'user-1')).toBe(false);
    });

    it('checks existence, media type and size before accepting an uploaded photo', async () => {
        (head as jest.Mock).mockResolvedValue({ url, pathname: path, contentType: 'image/png', size: 1024 });
        await expect(assertOwnedProfileImage(url, 'user-1')).resolves.toBeUndefined();
        expect(head).toHaveBeenCalledWith(url);

        (head as jest.Mock).mockResolvedValue({ url, pathname: path, contentType: 'text/html', size: 1024 });
        await expect(assertOwnedProfileImage(url, 'user-1')).rejects.toThrow('La foto de perfil no es válida');
        (head as jest.Mock).mockResolvedValue({ url, pathname: path, contentType: 'image/png', size: MAX_PROFILE_IMAGE_BYTES + 1 });
        await expect(assertOwnedProfileImage(url, 'user-1')).rejects.toThrow();
    });

    it('never deletes an asset outside the user path', async () => {
        await removeOldProfileImage(url, 'user-2');
        expect(del).not.toHaveBeenCalled();
        await removeOldProfileImage(url, 'user-1');
        expect(del).toHaveBeenCalledWith(url);
    });
});
