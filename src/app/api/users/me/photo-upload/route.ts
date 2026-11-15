import { handleUpload } from '@vercel/blob/client';
import { BlobUploadRequestSchema, BlobUploadResponseSchema } from '@/interfaces/http/blob-upload.contract';
import { getAuthenticatedActor } from '@/infrastructure/auth/authenticated-actor';
import { EmailUnverifiedError, InsufficientRoleError } from '@/exceptions/actor-access-errors';
import { UserNotLoggedError } from '@/exceptions/user-not-logged';
import { ProfileImageInvalidError } from '@/exceptions/profile-image-invalid';
import { isOwnedProfileImagePath, MAX_PROFILE_IMAGE_BYTES, PROFILE_IMAGE_CONTENT_TYPES } from '@/shared/user-profile-image';
import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { safeLogger } from '@/shared/observability/safe-logger';

/** Client uploads use a scoped token; Vercel's completion callback is signed by the provider. */
export async function POST(request: Request): Promise<Response> {
    let body: unknown;
    try {
        body = await request.json();
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
    const parsed = BlobUploadRequestSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: 'El evento de subida no es válido.' }, { status: 422 });

    try {
        const result = await handleUpload({
            request,
            body: parsed.data,
            onBeforeGenerateToken: async (pathname) => {
                const actor = await getAuthenticatedActor();
                if (actor.isAdmin) throw new InsufficientRoleError();
                if (!isOwnedProfileImagePath(pathname, actor.id)) throw new ProfileImageInvalidError();
                return {
                    allowedContentTypes: [...PROFILE_IMAGE_CONTENT_TYPES],
                    maximumSizeInBytes: MAX_PROFILE_IMAGE_BYTES,
                    addRandomSuffix: true,
                };
            },
            onUploadCompleted: async () => {
                // handleUpload verifies the provider callback before invoking this hook.
            },
        });
        return Response.json(BlobUploadResponseSchema.parse(result));
    } catch (error) {
        if (error instanceof ProfileImageInvalidError) {
            return Response.json({ error: 'La ruta de la foto no está permitida.' }, { status: 422 });
        }
        if (error instanceof InsufficientRoleError || error instanceof UserNotLoggedError || error instanceof EmailUnverifiedError) {
            return mapErrorToAPIResponse(error);
        }
        safeLogger.error('user.profile_image.upload.failed', { name: error instanceof Error ? error.name : 'unknown' });
        return Response.json({ error: 'No fue posible subir la foto.' }, { status: 500 });
    }
}
