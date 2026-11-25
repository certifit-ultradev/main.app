import { findClientProfileById, isProfileImageReferenced, updateClientProfileById } from '@/repository/users';
import type { ClientProfileRecord } from '@/application/users/user.records';
import type { ClientProfileDto } from '@/application/users/user.dto';
import type { UpdateClientProfileInput } from '@/interfaces/http/users/profile.contract';
import { InsufficientRoleError } from '@/exceptions/actor-access-errors';
import { NotFoundError } from '@/exceptions/not-found';
import { assertOwnedProfileImage, removeOldProfileImage } from '@/infrastructure/blob/profile-image';
import { executeService } from '@/utils/service-wrapper';

const toClientProfileDto = (user: ClientProfileRecord): ClientProfileDto => ({
    id: user.id,
    name: user.name,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    profileImage: user.profileImage,
    identification: user.identification,
    identificationType: user.identificationType,
    createdAt: user.createdAt.toISOString(),
});

const requireClient = async (userId: string): Promise<ClientProfileRecord> => {
    const user = await executeService(() => findClientProfileById(userId),
        { event: 'service.client_profile.read.failed' });
    if (!user) throw new NotFoundError('El usuario no existe.');
    if (user.isAdmin) throw new InsufficientRoleError();
    return user;
};

export const getClientProfile = async (userId: string): Promise<ClientProfileDto> =>
    toClientProfileDto(await requireClient(userId));

export const editClientProfile = async (
    userId: string,
    patch: UpdateClientProfileInput,
): Promise<ClientProfileDto> => {
    const previous = await requireClient(userId);
    if (patch.profileImage && patch.profileImage !== previous.profileImage) {
        await assertOwnedProfileImage(patch.profileImage, userId);
    }

    const updated = await executeService(() => updateClientProfileById(userId, patch),
        { event: 'service.client_profile.update.failed' });
    if (previous.profileImage && previous.profileImage !== updated.profileImage
        && !await isProfileImageReferenced(previous.profileImage)) {
        await removeOldProfileImage(previous.profileImage, userId);
    }
    return toClientProfileDto(updated);
};
