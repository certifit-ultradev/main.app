import { POST } from '@/src/app/api/blob-upload/route';
import { BlobUploadPolicyError, handleCourseBlobUpload } from '@/infrastructure/blob/vercel-client-upload';
import { getAuthenticatedActor } from '@/infrastructure/auth/authenticated-actor';
import { InsufficientRoleError } from '@/exceptions/actor-access-errors';
import { UserNotLoggedError } from '@/exceptions/user-not-logged';

jest.mock('@/infrastructure/auth/authenticated-actor', () => ({ getAuthenticatedActor: jest.fn() }));
jest.mock('@/infrastructure/blob/vercel-client-upload', () => {
    const actual = jest.requireActual('@/infrastructure/blob/vercel-client-upload');
    return { ...actual, handleCourseBlobUpload: jest.fn() };
});

const generateTokenEvent = {
    type: 'blob.generate-client-token',
    payload: {
        pathname: '/courses/1/asset.mp4',
        callbackUrl: 'https://app.example.com/api/blob-upload',
        multipart: true,
        clientPayload: null,
    },
};
const uploadCompletedEvent = {
    type: 'blob.upload-completed',
    payload: { blob: {
        url: 'https://blob.example.com/asset.mp4',
        downloadUrl: 'https://blob.example.com/asset.mp4?download=1',
        pathname: '/courses/1/asset.mp4',
        contentType: 'video/mp4',
        contentDisposition: 'inline',
    }, tokenPayload: null },
};

const request = (body: string) => new Request('http://localhost/api/blob-upload', { method: 'POST', body });

describe('POST /api/blob-upload', () => {
    beforeEach(() => jest.clearAllMocks());

    it('serializa la respuesta mínima de generación de token', async () => {
        (handleCourseBlobUpload as jest.Mock).mockResolvedValue({ type: 'blob.generate-client-token', clientToken: 'token' });

        const response = await POST(request(JSON.stringify(generateTokenEvent)));

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ type: 'blob.generate-client-token', clientToken: 'token' });
        expect(handleCourseBlobUpload).toHaveBeenCalledWith(expect.objectContaining({ body: generateTokenEvent }));
    });

    it('serializa el acuse mínimo del evento de subida completada', async () => {
        (handleCourseBlobUpload as jest.Mock).mockResolvedValue({ type: 'blob.upload-completed', response: 'ok' });

        const response = await POST(request(JSON.stringify(uploadCompletedEvent)));

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ type: 'blob.upload-completed', response: 'ok' });
        expect(handleCourseBlobUpload).toHaveBeenCalledWith(expect.objectContaining({ body: uploadCompletedEvent }));
    });

    it('rechaza una respuesta inesperada del adaptador sin filtrarla por HTTP', async () => {
        (handleCourseBlobUpload as jest.Mock).mockResolvedValue({
            type: 'blob.generate-client-token', clientToken: '', providerMetadata: 'private',
        });

        const response = await POST(request(JSON.stringify(generateTokenEvent)));

        expect(response.status).toBe(502);
        await expect(response.json()).resolves.toEqual({ error: 'No se pudo procesar la subida.' });
    });

    it('rechaza JSON malformado y sobres de protocolo inválidos', async () => {
        const malformed = await POST(request('{'));
        expect(malformed.status).toBe(400);
        await expect(malformed.json()).resolves.toEqual({ error: 'El cuerpo de la solicitud no contiene JSON válido.' });

        const invalid = await POST(request(JSON.stringify({ type: 'multipart' })));
        expect(invalid.status).toBe(422);
        await expect(invalid.json()).resolves.toEqual({ error: 'El evento de subida no es válido.' });
        expect((await POST(request(JSON.stringify({ type: 'blob.upload-completed', payload: { blob: {} } })))).status).toBe(422);
        expect(handleCourseBlobUpload).not.toHaveBeenCalled();
    });

    it('traduce denegaciones de política a su status HTTP', async () => {
        (handleCourseBlobUpload as jest.Mock).mockRejectedValue(new BlobUploadPolicyError(403, 'No tienes permisos de administrador.'));
        const response = await POST(request(JSON.stringify(generateTokenEvent)));

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({ error: 'No tienes permisos de administrador.' });
    });

    it.each([
        [new UserNotLoggedError('private@example.com'), 401, 'Debes iniciar sesión.'],
        [new InsufficientRoleError(), 403, 'No tienes permisos de administrador.'],
    ] as const)('preserva el protocolo Blob para un actor rechazado %#', async (error, status, message) => {
        (getAuthenticatedActor as jest.Mock).mockRejectedValue(error);
        (handleCourseBlobUpload as jest.Mock).mockImplementation(async ({ authorizeAdmin }) => {
            await authorizeAdmin();
            return { type: 'blob.generate-client-token', clientToken: 'token' };
        });

        const response = await POST(request(JSON.stringify(generateTokenEvent)));
        const body = await response.json();
        expect(response.status).toBe(status);
        expect(body).toEqual({ error: message });
        expect(JSON.stringify(body)).not.toContain('private@example.com');
        expect(getAuthenticatedActor).toHaveBeenCalledWith({ requireAdmin: true, requireEmailVerified: false });
    });
});
