import type { CourseSalesDto, MonthlyCountDto } from '@/application/courses/course-analytics.ports';

/** Direction is closed so report clients cannot rely on arbitrary strings. */
export type ReportTrend = 'up' | 'down';

export type CourseSalesReportDto = Readonly<{
    course_name: string;
    total: number;
}>;

export type CountVariationReportDto = Readonly<{
    count: number;
    arrowDirection: ReportTrend;
}>;

export type PercentageVariationReportDto = Readonly<{
    percentage: number;
    arrowDirection: ReportTrend;
}>;

const trendFor = (current: number, previous: number): ReportTrend => current > previous ? 'up' : 'down';

/** Base zero policy: zero-to-zero is stable/down; a positive current value is up. */
export const toCountVariationReport = ({ current_month_count, previous_month_count }: MonthlyCountDto): CountVariationReportDto => ({
    count: current_month_count,
    arrowDirection: trendFor(current_month_count, previous_month_count),
});

/** Base zero policy: use 0% when both counts are zero and 100% for a first positive period. */
export const toPercentageVariationReport = ({ current_month_count, previous_month_count }: MonthlyCountDto): PercentageVariationReportDto => ({
    percentage: previous_month_count === 0
        ? (current_month_count === 0 ? 0 : 100)
        : Math.abs(Math.round(((current_month_count - previous_month_count) / previous_month_count) * 100)),
    arrowDirection: trendFor(current_month_count, previous_month_count),
});

export const toCourseSalesReport = (sales: readonly CourseSalesDto[]): CourseSalesReportDto[] => sales.map(({ course_name, total }) => ({
    course_name,
    total,
}));
