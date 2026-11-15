export const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;
export const PROFILE_IMAGE_CONTENT_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;

export function isOwnedProfileImagePath(pathname: string, userId: string): boolean {
    const normalized = `/${pathname.replace(/^\/+/, '')}`;
    const match = /^\/users\/([^/]+)\/profile\/[a-f0-9-]{36}(?:-[A-Za-z0-9]+)?\.(?:png|jpe?g|webp)$/.exec(normalized);
    return match?.[1] === userId;
}

export function isOwnedProfileImageUrl(value: string, userId: string): boolean {
    try {
        const url = new URL(value);
        return url.protocol === 'https:' && !url.port && !url.username && !url.password && !url.search && !url.hash
            && /^[a-z0-9]+\.public\.blob\.vercel-storage\.com$/.test(url.hostname)
            && isOwnedProfileImagePath(url.pathname, userId);
    } catch {
        return false;
    }
}
