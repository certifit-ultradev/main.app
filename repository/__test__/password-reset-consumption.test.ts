import { consumePasswordResetTokenAndUpdatePassword } from '@/repository/password-reset-token';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({ prisma: { $transaction: jest.fn() } }));

describe('atomic password-reset token consumption', () => {
    const transaction = {
        passwordResetToken: { findUnique: jest.fn(), deleteMany: jest.fn() },
        user: { findFirst: jest.fn(), update: jest.fn() },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (prisma.$transaction as jest.Mock).mockImplementation((callback) => callback(transaction));
    });

    it('returns invalid when no token exists', async () => {
        transaction.passwordResetToken.findUnique.mockResolvedValue(null);
        await expect(consumePasswordResetTokenAndUpdatePassword('token', 'password-hash')).resolves.toEqual({ status: 'invalid_token' });
        expect(transaction.user.update).not.toHaveBeenCalled();
    });

    it('returns expired when the token has expired', async () => {
        transaction.passwordResetToken.findUnique.mockResolvedValue({ expires: new Date('2020-01-01'), email: 'user@example.com' });
        await expect(consumePasswordResetTokenAndUpdatePassword('token', 'password-hash', new Date('2021-01-01'))).resolves.toEqual({ status: 'expired_token' });
        expect(transaction.user.update).not.toHaveBeenCalled();
    });

    it('returns user_missing without consuming the token', async () => {
        transaction.passwordResetToken.findUnique.mockResolvedValue({ id: 'reset-1', expires: new Date('2030-01-01'), email: 'missing@example.com' });
        transaction.user.findFirst.mockResolvedValue(null);
        await expect(consumePasswordResetTokenAndUpdatePassword('token', 'password-hash', new Date('2029-01-01'))).resolves.toEqual({ status: 'user_missing' });
        expect(transaction.passwordResetToken.deleteMany).not.toHaveBeenCalled();
    });

    it('updates the password then consumes the token in one transaction', async () => {
        transaction.passwordResetToken.findUnique.mockResolvedValue({ id: 'reset-1', expires: new Date('2030-01-01'), email: 'user@example.com' });
        transaction.user.findFirst.mockResolvedValue({ id: 'user-1' });
        transaction.user.update.mockResolvedValue({ id: 'user-1' });
        transaction.passwordResetToken.deleteMany.mockResolvedValue({ count: 1 });

        await expect(consumePasswordResetTokenAndUpdatePassword('token', 'password-hash', new Date('2029-01-01'))).resolves.toEqual({ status: 'success' });
        expect(transaction.user.update).toHaveBeenCalledWith({ where: { id: 'user-1' }, data: { password: 'password-hash' } });
        expect((transaction.user.update as jest.Mock).mock.invocationCallOrder[0]).toBeLessThan(
            (transaction.passwordResetToken.deleteMany as jest.Mock).mock.invocationCallOrder[0],
        );
    });

    it('does not consume the token when changing the password fails', async () => {
        transaction.passwordResetToken.findUnique.mockResolvedValue({ id: 'reset-1', expires: new Date('2030-01-01'), email: 'user@example.com' });
        transaction.user.findFirst.mockResolvedValue({ id: 'user-1' });
        transaction.user.update.mockRejectedValue(new Error('Database write failed'));

        await expect(consumePasswordResetTokenAndUpdatePassword('token', 'password-hash', new Date('2029-01-01'))).rejects.toThrow('Database write failed');
        expect(transaction.passwordResetToken.deleteMany).not.toHaveBeenCalled();
    });
});
