import { del } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { processCourseAssetCleanup } from '@/infrastructure/blob/course-asset-cleanup';

jest.mock('@vercel/blob', () => ({ del: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ prisma: {
    courseAssetCleanup: { findMany: jest.fn(), delete: jest.fn(), update: jest.fn() },
    course: { count: jest.fn() }, moduleClass: { count: jest.fn() },
} }));

const oldUrl = 'https://store.public.blob.vercel-storage.com/courses/7/old.png';

describe('course asset cleanup', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (prisma.courseAssetCleanup.findMany as jest.Mock).mockResolvedValue([{ id: 1, courseId: 7, url: oldUrl }]);
        (prisma.course.count as jest.Mock).mockResolvedValue(0);
        (prisma.moduleClass.count as jest.Mock).mockResolvedValue(0);
    });

    it('deletes an unreferenced old blob after the database write', async () => {
        await processCourseAssetCleanup(7);
        expect(del).toHaveBeenCalledWith(oldUrl);
        expect(prisma.courseAssetCleanup.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('never deletes a blob that is still referenced', async () => {
        (prisma.course.count as jest.Mock).mockResolvedValue(1);
        await processCourseAssetCleanup(7);
        expect(del).not.toHaveBeenCalled();
    });

    it('retains a failed deletion for retry', async () => {
        (del as jest.Mock).mockRejectedValueOnce(new Error('provider unavailable'));
        await processCourseAssetCleanup(7);
        expect(prisma.courseAssetCleanup.delete).not.toHaveBeenCalled();
        expect(prisma.courseAssetCleanup.update).toHaveBeenCalledWith({
            where: { id: 1 }, data: { attempts: { increment: 1 }, lastAttemptAt: expect.any(Date) },
        });
    });
});
