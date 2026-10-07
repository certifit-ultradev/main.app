import type { PaymentCourseReadPort, PaymentCourseRecord } from '@/application/payments/payment-course-read.ports';
import { prisma } from '@/lib/prisma';

/** Prisma adapter for the payment quote use case. */
export const prismaPaymentCourseReadPort: PaymentCourseReadPort = {
    async findCourseForQuote(canonicalId: string): Promise<PaymentCourseRecord | null> {
        return prisma.course.findFirst({
            where: { canonicalId, deleted: false },
            select: { id: true, canonicalId: true, price: true, isActive: true, expiresAt: true },
        });
    },

    async hasEnrollment(courseId: number, userId: string): Promise<boolean> {
        const enrollment = await prisma.userCourse.findFirst({
            where: { courseId, userId: userId },
            select: { id: true },
        });
        return enrollment !== null;
    },
};
