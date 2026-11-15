import { del, head } from '@vercel/blob';
import { ProfileImageInvalidError } from '@/exceptions/profile-image-invalid';
import { safeLogger } from '@/shared/observability/safe-logger';
import { isOwnedProfileImagePath, isOwnedProfileImageUrl, MAX_PROFILE_IMAGE_BYTES, PROFILE_IMAGE_CONTENT_TYPES } from '@/shared/user-profile-image';

/** Verify that the URL belongs to this user and to the configured Blob store. */
export async function assertOwnedProfileImage(value: string, userId: string): Promise<void> {
    if (!isOwnedProfileImageUrl(value, userId)) throw new ProfileImageInvalidError();
    try {
        const blob = await head(value);
        if (blob.url !== value || !isOwnedProfileImagePath(blob.pathname, userId)
            || !PROFILE_IMAGE_CONTENT_TYPES.includes(blob.contentType as typeof PROFILE_IMAGE_CONTENT_TYPES[number])
            || blob.size > MAX_PROFILE_IMAGE_BYTES) {
            throw new ProfileImageInvalidError();
        }
    } catch (error) {
        if (!(error instanceof ProfileImageInvalidError)) {
            safeLogger.error('user.profile_image.verify.failed', { name: error instanceof Error ? error.name : 'unknown' });
        }
        throw new ProfileImageInvalidError();
    }
}

export async function removeOldProfileImage(value: string, userId: string): Promise<void> {
    if (!isOwnedProfileImageUrl(value, userId)) return;
    try {
        await del(value);
    } catch (error) {
        safeLogger.error('user.profile_image.cleanup.failed', { name: error instanceof Error ? error.name : 'unknown' });
    }
}
