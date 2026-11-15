import { editClientProfile, getClientProfile } from '@/services/client-profile';
import { findClientProfileById, isProfileImageReferenced, updateClientProfileById } from '@/repository/users';
import { assertOwnedProfileImage, removeOldProfileImage } from '@/infrastructure/blob/profile-image';

jest.mock('@/repository/users', () => ({
    findClientProfileById: jest.fn(),
    isProfileImageReferenced: jest.fn(),
    updateClientProfileById: jest.fn(),
}));
jest.mock('@/infrastructure/blob/profile-image', () => ({
    assertOwnedProfileImage: jest.fn(),
    removeOldProfileImage: jest.fn(),
}));

const existing = {
    id: 'client-1', name: 'Pablo', lastName: 'Lozano', email: 'pablo@example.com',
    phoneNumber: '3001234567', profileImage: 'https://old.example.com/photo.png',
    identification: null, identificationType: null, createdAt: new Date('2026-01-01T00:00:00.000Z'),
    isAdmin: false, passwordHash: 'secret',
};

describe('client profile service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (findClientProfileById as jest.Mock).mockResolvedValue(existing);
        (updateClientProfileById as jest.Mock).mockResolvedValue(existing);
        (isProfileImageReferenced as jest.Mock).mockResolvedValue(false);
    });

    it('returns the client projection without credentials or role', async () => {
        const profile = await getClientProfile('client-1');
        expect(profile).toMatchObject({ id: 'client-1', name: 'Pablo', email: existing.email });
        expect(profile).not.toHaveProperty('isAdmin');
        expect(profile).not.toHaveProperty('password');
        expect(profile).not.toHaveProperty('passwordHash');
    });

    it('rejects administrators even if the route passes an admin id', async () => {
        (findClientProfileById as jest.Mock).mockResolvedValue({ ...existing, isAdmin: true });
        await expect(editClientProfile('client-1', { name: 'Paulo' })).rejects.toThrow();
        expect(updateClientProfileById).not.toHaveBeenCalled();
    });

    it('verifies a new photo and deletes the previous one only after persistence', async () => {
        const photo = 'https://new.example.com/photo.png';
        (updateClientProfileById as jest.Mock).mockResolvedValue({ ...existing, profileImage: photo });
        await editClientProfile('client-1', { profileImage: photo });
        expect(assertOwnedProfileImage).toHaveBeenCalledWith(photo, 'client-1');
        expect(updateClientProfileById).toHaveBeenCalledWith('client-1', { profileImage: photo });
        expect(removeOldProfileImage).toHaveBeenCalledWith(existing.profileImage, 'client-1');
        expect((updateClientProfileById as jest.Mock).mock.invocationCallOrder[0]).toBeLessThan(
            (removeOldProfileImage as jest.Mock).mock.invocationCallOrder[0],
        );
    });

    it('keeps the previous photo when persistence fails', async () => {
        (updateClientProfileById as jest.Mock).mockRejectedValue(new Error('database unavailable'));
        await expect(editClientProfile('client-1', { profileImage: null })).rejects.toThrow('database unavailable');
        expect(removeOldProfileImage).not.toHaveBeenCalled();
    });
});
