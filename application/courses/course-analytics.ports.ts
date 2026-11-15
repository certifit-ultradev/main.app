/** Serializable projections consumed by the course reporting endpoints. */
export type CourseSalesDto = {
    course_name: string;
    total: number;
};

export type MonthlyCountDto = {
    current_month_count: number;
    previous_month_count: number;
};

export interface CourseAnalyticsReadPort {
    findSalesByCourse(): Promise<CourseSalesDto[]>;
    findApprovedSalesByMonth(): Promise<MonthlyCountDto>;
    findRegisteredUsersByMonth(): Promise<MonthlyCountDto>;
}
