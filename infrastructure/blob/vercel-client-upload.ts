import type { BlobUploadRequest, BlobUploadResponse } from '@/interfaces/http/blob-upload.contract';
import { handleUpload } from '@vercel/blob/client';
import { prisma } from '@/lib/prisma';

const COURSE_ASSET_PATHNAME = /^\/courses\/([1-9]\d*)\/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:mp4|png|jpe?g)$/;
const COURSE_ASSET_CONTENT_TYPES = ['video/mp4', 'image/jpeg', 'image/png'] as const;

export class BlobUploadPolicyError extends Error {
    constructor(
        readonly status: 401 | 403 | 422,
        message: string,
    ) {
        super(message);
        this.name = 'BlobUploadPolicyError';
    }
}

export type BlobUploadAuthorizer = () => Promise<{ id: string }>;

export type CourseBlobUploadInput = {
    request: Request;
    body: BlobUploadRequest;
    authorizeAdmin: BlobUploadAuthorizer;
    courseExists?: (courseId: number) => Promise<boolean>;
};

export const isAllowedCourseAssetPath = (pathname: string): boolean => COURSE_ASSET_PATHNAME.test(pathname);

/** Provider adapter for direct course-asset uploads from the browser. */
export async function handleCourseBlobUpload({ request, body, authorizeAdmin, courseExists = async (id) =>
    Boolean(await prisma.course.findFirst({ where: { id, deleted: false }, select: { id: true } })) }: CourseBlobUploadInput): Promise<BlobUploadResponse> {
    const result = await handleUpload({
        request,
        body,
        onBeforeGenerateToken: async (pathname) => {
            let actor: { id: string };
            try {
                actor = await authorizeAdmin();
            } catch (error) {
                if (error instanceof BlobUploadPolicyError) throw error;
                throw new BlobUploadPolicyError(403, 'No tienes permisos de administrador.');
            }

            const match = COURSE_ASSET_PATHNAME.exec(pathname);
            if (!match || !await courseExists(Number(match[1]))) {
                throw new BlobUploadPolicyError(422, 'La ruta del archivo no está permitida.');
            }

            return {
                allowedContentTypes: [...COURSE_ASSET_CONTENT_TYPES],
                addRandomSuffix: true,
                tokenPayload: JSON.stringify({ assetScope: 'course', userId: actor.id }),
            };
        },
        onUploadCompleted: async () => {
            // The provider verifies its signed callback before invoking this hook.
            // Asset metadata is intentionally not logged.
        },
    });

    if (result.type === 'blob.generate-client-token') {
        return { type: result.type, clientToken: result.clientToken };
    }
    return { type: result.type, response: result.response };
}
