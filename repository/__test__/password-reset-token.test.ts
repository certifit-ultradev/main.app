import { prisma } from '@/lib/prisma';
import {
    createPasswordResetToken,
    deletePasswordResetToken,
    findPasswordResetTokenByEmail,
    findPasswordResetTokenByToken,
} from '@/repository/password-reset-token';

jest.mock('@/lib/prisma', () => ({
    prisma: {
        passwordResetToken: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

describe('password reset token repository records', () => {
    const record = { id: 'reset-1', email: 'user@example.com', token: 'secret', expires: new Date('2030-01-01') };

    beforeEach(() => jest.clearAllMocks());

    it('uses null for an absent token', async () => {
        (prisma.passwordResetToken.findUnique as jest.Mock).mockResolvedValue(null);
        await expect(findPasswordResetTokenByToken('missing')).resolves.toBeNull();
        (prisma.passwordResetToken.findFirst as jest.Mock).mockResolvedValue(null);
        await expect(findPasswordResetTokenByEmail('missing@example.com')).resolves.toBeNull();
    });

    it('replaces a prior email token and returns the created record', async () => {
        const input = { email: record.email, token: record.token, expires: record.expires };
        (prisma.passwordResetToken.findFirst as jest.Mock).mockResolvedValue({ ...record, id: 'prior-reset' });
        (prisma.passwordResetToken.create as jest.Mock).mockResolvedValue(record);

        await expect(createPasswordResetToken(input)).resolves.toEqual(record);
        expect(prisma.passwordResetToken.delete).toHaveBeenCalledWith({ where: { id: 'prior-reset' } });
        expect(prisma.passwordResetToken.create).toHaveBeenCalledWith({ data: input });
    });

    it('deletes a token by token value', async () => {
        (prisma.passwordResetToken.delete as jest.Mock).mockResolvedValue(record);
        await expect(deletePasswordResetToken(record.token)).resolves.toEqual(record);
    });
});
