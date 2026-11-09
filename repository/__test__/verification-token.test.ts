import { prisma } from '@/lib/prisma';
import {
    createVerificationToken,
    deleteVerificationToken,
    findVerificationTokenByEmail,
    findVerificationTokenByToken,
} from '@/repository/verification-token';

jest.mock('@/lib/prisma', () => ({
    prisma: {
        verificationToken: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

describe('verification token repository records', () => {
    const record = { id: 'token-1', email: 'user@example.com', token: 'secret', expires: new Date('2030-01-01') };

    beforeEach(() => jest.clearAllMocks());

    it('returns a record or null when searching by token', async () => {
        (prisma.verificationToken.findUnique as jest.Mock).mockResolvedValue(record);
        await expect(findVerificationTokenByToken('secret')).resolves.toEqual(record);

        (prisma.verificationToken.findUnique as jest.Mock).mockResolvedValue(null);
        await expect(findVerificationTokenByToken('missing')).resolves.toBeNull();
    });

    it('uses normal null semantics when searching by email', async () => {
        (prisma.verificationToken.findFirst as jest.Mock).mockResolvedValue(null);
        await expect(findVerificationTokenByEmail('missing@example.com')).resolves.toBeNull();
    });

    it('creates a record from a closed creation record', async () => {
        const input = { email: record.email, token: record.token, expires: record.expires };
        (prisma.verificationToken.create as jest.Mock).mockResolvedValue(record);

        await expect(createVerificationToken(input)).resolves.toEqual(record);
        expect(prisma.verificationToken.create).toHaveBeenCalledWith({ data: input });
    });

    it('deletes by persistent identifier', async () => {
        (prisma.verificationToken.delete as jest.Mock).mockResolvedValue(record);
        await expect(deleteVerificationToken(record.id)).resolves.toEqual(record);
        expect(prisma.verificationToken.delete).toHaveBeenCalledWith({ where: { id: record.id } });
    });
});
