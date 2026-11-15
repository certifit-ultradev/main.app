import { BlobUploadPolicyError, handleCourseBlobUpload, isAllowedCourseAssetPath } from '@/infrastructure/blob/vercel-client-upload';
import { handleUpload } from '@vercel/blob/client';

jest.mock('@vercel/blob/client', () => ({ handleUpload: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ prisma: { course: { findFirst: jest.fn().mockResolvedValue({ id: 1 }) } } }));

const body = {
    type: 'blob.generate-client-token' as const,
    payload: {
        pathname: '/courses/1/asset.mp4',
        callbackUrl: 'https://app.example.com/api/blob-upload',
        multipart: true,
        clientPayload: null,
    },
};

describe('Vercel course-asset upload adapter', () => {
    let beforeGenerateToken: ((pathname: string) => Promise<unknown>) | undefined;

    beforeEach(() => {
        jest.clearAllMocks();
        (handleUpload as jest.Mock).mockImplementation(async (options) => {
            beforeGenerateToken = options.onBeforeGenerateToken;
            return { type: 'blob.generate-client-token', clientToken: 'token' };
        });
    });

    it('emite token sólo para admin y limita MIME, ruta y payload', async () => {
        const response = await handleCourseBlobUpload({
            request: new Request('https://app.example.com/api/blob-upload'),
            body,
            authorizeAdmin: async () => ({ id: 'admin-1' }),
        });

        expect(response).toEqual({ type: 'blob.generate-client-token', clientToken: 'token' });

        await expect(beforeGenerateToken!('/courses/1/asset.mp4')).resolves.toEqual({
            allowedContentTypes: ['video/mp4', 'image/jpeg', 'image/png'],
            addRandomSuffix: true,
            tokenPayload: JSON.stringify({ assetScope: 'course', userId: 'admin-1' }),
        });
    });

    it('retorna sólo el acuse mínimo cuando el SDK confirma la subida', async () => {
        (handleUpload as jest.Mock).mockResolvedValue({
            type: 'blob.upload-completed', response: 'ok', providerMetadata: { secret: 'not-public' },
        });

        const response = await handleCourseBlobUpload({
            request: new Request('https://app.example.com/api/blob-upload'),
            body: { type: 'blob.upload-completed', payload: { blob: {
                url: 'https://blob.example.com/asset.mp4',
                downloadUrl: 'https://blob.example.com/asset.mp4?download=1',
                pathname: '/courses/1/asset.mp4',
                contentType: 'video/mp4',
                contentDisposition: 'inline',
            }, tokenPayload: null } },
            authorizeAdmin: async () => ({ id: 'admin-1' }),
        });

        expect(response).toEqual({ type: 'blob.upload-completed', response: 'ok' });
    });

    it('deniega actores no administradores y rutas fuera del espacio de cursos', async () => {
        await handleCourseBlobUpload({
            request: new Request('https://app.example.com/api/blob-upload'),
            body,
            authorizeAdmin: async () => { throw new Error('not admin'); },
        });
        await expect(beforeGenerateToken!('/courses/1/asset.mp4')).rejects.toMatchObject({ status: 403 });

        await handleCourseBlobUpload({
            request: new Request('https://app.example.com/api/blob-upload'),
            body,
            authorizeAdmin: async () => ({ id: 'admin-1' }),
        });
        await expect(beforeGenerateToken!('/users/1/avatar.png')).rejects.toMatchObject({ status: 422 });
    });

    it('preserves a typed authentication denial from the route authorizer', async () => {
        await handleCourseBlobUpload({
            request: new Request('https://app.example.com/api/blob-upload'),
            body,
            authorizeAdmin: async () => { throw new BlobUploadPolicyError(401, 'Debes iniciar sesión.'); },
        });
        await expect(beforeGenerateToken!('/courses/1/asset.mp4')).rejects.toMatchObject({
            status: 401,
            message: 'Debes iniciar sesión.',
        });
    });

    it('acepta exclusivamente el prefijo y extensiones permitidos', () => {
        expect(isAllowedCourseAssetPath('/courses/pending/asset.jpg')).toBe(false);
        expect(isAllowedCourseAssetPath('/courses/12/video.mp4')).toBe(true);
        expect(isAllowedCourseAssetPath('/courses/0/video.mp4')).toBe(false);
        expect(isAllowedCourseAssetPath('/courses/12/video.pdf')).toBe(false);
    });
});
