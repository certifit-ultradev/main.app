import { requestEmailVerification } from '@/services/verification-token';
import { getUserByEmail } from '@/services/user';
import { createVerificationToken } from '@/repository/verification-token';
import { nodemailerEmailGateway } from '@/infrastructure/notifications/nodemailer-email-gateway';

jest.mock('@/services/user', () => ({ getUserByEmail: jest.fn() }));
jest.mock('@/repository/verification-token', () => ({
    createVerificationToken: jest.fn(),
    deleteVerificationToken: jest.fn(),
    findVerificationTokenByToken: jest.fn(),
}));
jest.mock('@/infrastructure/notifications/nodemailer-email-gateway', () => ({
    nodemailerEmailGateway: { sendVerificationLink: jest.fn() },
}));
jest.mock('@/utils/service-wrapper', () => ({ executeService: (operation: () => unknown) => operation() }));
jest.mock('@/infrastructure/identity/uuid-identity-token-generator', () => ({
    uuidIdentityTokenGenerator: { generate: jest.fn(() => ({ token: 'secret-token', expires: new Date('2030-01-01') })) },
}));

describe('requestEmailVerification', () => {
    beforeEach(() => jest.clearAllMocks());

    it.each([
        ['unknown account', null],
        ['already verified account', { id: 'user-1', emailVerified: new Date() }],
    ])('does not create or send a token for an %s', async (_description, user) => {
        (getUserByEmail as jest.Mock).mockResolvedValue(user);

        await requestEmailVerification('user@example.com');

        expect(createVerificationToken).not.toHaveBeenCalled();
        expect(nodemailerEmailGateway.sendVerificationLink).not.toHaveBeenCalled();
    });

    it('sends a token only for an existing unverified account', async () => {
        (getUserByEmail as jest.Mock).mockResolvedValue({ id: 'user-1', emailVerified: null });
        (createVerificationToken as jest.Mock).mockResolvedValue({ token: 'secret-token' });

        await requestEmailVerification('user@example.com');

        expect(nodemailerEmailGateway.sendVerificationLink).toHaveBeenCalledWith({ email: 'user@example.com', token: 'secret-token' });
    });
});
