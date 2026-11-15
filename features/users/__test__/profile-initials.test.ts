import { profileInitials } from '@/features/users/profile-initials';

describe('profile initials', () => {
    it('uses the first name and first surname in uppercase', () => {
        expect(profileInitials('Pablo', 'Lozano')).toBe('PL');
        expect(profileInitials('  María José ', '  García López ')).toBe('MG');
    });
});
