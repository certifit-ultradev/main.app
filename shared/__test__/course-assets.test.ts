import { isCourseAssetUrlForId, isManagedCourseAssetUrl } from '@/shared/course-assets';

describe('managed course blob URLs', () => {
    it('accepts persisted course assets and legacy pending assets for cleanup only', () => {
        expect(isManagedCourseAssetUrl('https://store.public.blob.vercel-storage.com/courses/7/image.png')).toBe(true);
        expect(isManagedCourseAssetUrl('https://store.public.blob.vercel-storage.com/courses/pending/old.jpg')).toBe(true);
    });

    it('never treats arbitrary or local URLs as deletable', () => {
        expect(isManagedCourseAssetUrl('https://example.com/courses/7/image.png')).toBe(false);
        expect(isManagedCourseAssetUrl('/logo.png')).toBe(false);
        expect(isManagedCourseAssetUrl('')).toBe(false);
        expect(isManagedCourseAssetUrl('https://store.public.blob.vercel-storage.com/users/7/avatar.png')).toBe(false);
    });

    it('limits newly uploaded cleanup candidates to their own course', () => {
        expect(isCourseAssetUrlForId('https://store.public.blob.vercel-storage.com/courses/7/image.png', 7)).toBe(true);
        expect(isCourseAssetUrlForId('https://store.public.blob.vercel-storage.com/courses/8/image.png', 7)).toBe(false);
    });
});
