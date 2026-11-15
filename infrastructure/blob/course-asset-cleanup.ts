import { del } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { isManagedCourseAssetUrl } from '@/shared/course-assets';
import { safeLogger } from '@/shared/observability/safe-logger';

/** Retries durable cleanup jobs after the database has stopped referencing an old asset. */
export async function processCourseAssetCleanup(courseId?: number): Promise<void> {
    const jobs = await prisma.courseAssetCleanup.findMany({
        where: { availableAt: { lte: new Date() }, ...(courseId === undefined ? {} : { courseId }) },
        orderBy: { createdAt: 'asc' },
        take: 50,
    });

    for (const job of jobs) {
        try {
            const [courseReferences, videoReferences] = await Promise.all([
                prisma.course.count({ where: { OR: [{ courseImage: job.url }, { instructorPhoto: job.url }] } }),
                prisma.moduleClass.count({ where: { videoPath: job.url } }),
            ]);
            if (courseReferences === 0 && videoReferences === 0 && isManagedCourseAssetUrl(job.url)) {
                await del(job.url);
            }
            // A referenced or unmanaged asset must never be deleted. A later
            // replacement will enqueue it again when it actually becomes old.
            await prisma.courseAssetCleanup.delete({ where: { id: job.id } });
        } catch {
            await prisma.courseAssetCleanup.update({
                where: { id: job.id }, data: { attempts: { increment: 1 }, lastAttemptAt: new Date() },
            });
            safeLogger.error('course.asset_cleanup.failed', { jobId: job.id });
        }
    }
}
