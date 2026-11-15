/** Only files under our course namespace in Vercel Blob may be deleted. */
export const RETRYABLE_COURSE_ASSET_CLEANUP_DELAY_MS = 24 * 60 * 60_000;
// Leave an hour between the last safe reuse and scheduled cleanup.
export const COURSE_ASSET_REUSE_WINDOW_MS = 23 * 60 * 60_000;
export const COURSE_IMAGE_CLEANUP_DELAY_MS = 5 * 60_000;

export function isManagedCourseAssetUrl(value: string): boolean {
    try {
        const url = new URL(value);
        return url.protocol === 'https:'
            && url.hostname.endsWith('.public.blob.vercel-storage.com')
            && /^\/courses\/(?:pending|[1-9]\d*)\/[A-Za-z0-9._-]+\.(?:mp4|png|jpe?g)$/.test(url.pathname);
    } catch {
        return false;
    }
}

export function isCourseAssetUrlForId(value: string, courseId: number): boolean {
    if (!isManagedCourseAssetUrl(value)) return false;
    return new URL(value).pathname.startsWith(`/courses/${courseId}/`);
}
