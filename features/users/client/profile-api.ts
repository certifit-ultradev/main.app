import { upload } from '@vercel/blob/client';
import { v4 as uuidv4 } from 'uuid';
import type { ClientProfileDto } from '@/application/users/user.dto';
import { apiSuccessSchema, ApiFailureSchema } from '@/interfaces/http/api-response.schema';
import { ClientProfileSchema, type UpdateClientProfileInput } from '@/interfaces/http/users/profile.contract';
import { MAX_PROFILE_IMAGE_BYTES, PROFILE_IMAGE_CONTENT_TYPES } from '@/shared/user-profile-image';

async function parseProfileResponse(response: Response): Promise<ClientProfileDto> {
    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) {
        const failure = ApiFailureSchema.safeParse(body);
        throw new Error(failure.success ? failure.data.error.message : 'No fue posible consultar el perfil.');
    }
    const success = apiSuccessSchema(ClientProfileSchema).safeParse(body);
    if (!success.success) throw new Error('El servidor devolvió un perfil con formato inválido.');
    return success.data.data;
}

export async function fetchClientProfile(signal?: AbortSignal): Promise<ClientProfileDto> {
    return parseProfileResponse(await fetch('/api/users/me', { cache: 'no-store', signal }));
}

export async function saveClientProfile(patch: UpdateClientProfileInput): Promise<ClientProfileDto> {
    return parseProfileResponse(await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
    }));
}

export async function uploadClientProfileImage(userId: string, file: File): Promise<string> {
    if (!PROFILE_IMAGE_CONTENT_TYPES.includes(file.type as typeof PROFILE_IMAGE_CONTENT_TYPES[number])
        || file.size > MAX_PROFILE_IMAGE_BYTES || file.size === 0) {
        throw new Error('La foto debe ser JPG, PNG o WebP y pesar máximo 5 MB.');
    }
    const extension = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp';
    const blob = await upload(`users/${userId}/profile/${uuidv4()}.${extension}`, file, {
        access: 'public', handleUploadUrl: '/api/users/me/photo-upload',
    });
    return blob.url;
}
