import type { CourseAnalyticsReadPort, CourseSalesDto, MonthlyCountDto } from '@/application/courses/course-analytics.ports';
import { prisma } from '@/lib/prisma';

type RawCourseSale = { course_name: string; total: bigint | number };
type RawMonthlyCount = { current_month_count: bigint | number; previous_month_count: bigint | number };

const toMonthlyCount = (row: RawMonthlyCount | undefined): MonthlyCountDto => ({
    current_month_count: Number(row?.current_month_count ?? 0),
    previous_month_count: Number(row?.previous_month_count ?? 0),
});

/** Prisma adapter for reporting only. It exposes no model classes or UI contracts. */
export const prismaCourseAnalyticsReadPort: CourseAnalyticsReadPort = {
    async findSalesByCourse(): Promise<CourseSalesDto[]> {
        const rows = await prisma.$queryRaw<RawCourseSale[]>`
            SELECT CONCAT(c.id, ' - ', c.title) AS course_name,
                COUNT(p.id) AS total
            FROM "Purchase" p
            INNER JOIN "Cart" cart ON cart.id = p.cart_id
            INNER JOIN "Course" c ON c.id = cart.course_id
            GROUP BY c.id
        `;

        return rows.map((row) => ({
            course_name: `${row.course_name.substring(0, 20)}...`,
            total: Number(row.total),
        }));
    },

    async findApprovedSalesByMonth(): Promise<MonthlyCountDto> {
        const [row] = await prisma.$queryRaw<RawMonthlyCount[]>`
            SELECT
                COUNT(*) FILTER (
                    WHERE date_trunc('month', p.created_at) = date_trunc('month', CURRENT_DATE)
                ) AS current_month_count,
                COUNT(*) FILTER (
                    WHERE date_trunc('month', p.created_at) = date_trunc('month', CURRENT_DATE - interval '1 month')
                ) AS previous_month_count
            FROM "Purchase" p
            WHERE p.status = 'APPROVED'
        `;
        return toMonthlyCount(row);
    },

    async findRegisteredUsersByMonth(): Promise<MonthlyCountDto> {
        const [row] = await prisma.$queryRaw<RawMonthlyCount[]>`
            SELECT
                COUNT(*) FILTER (
                    WHERE date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)
                ) AS current_month_count,
                COUNT(*) FILTER (
                    WHERE date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE - interval '1 month')
                ) AS previous_month_count
            FROM "User"
        `;
        return toMonthlyCount(row);
    },
};
