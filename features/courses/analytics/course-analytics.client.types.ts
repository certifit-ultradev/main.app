import type { ReportTrend } from '@/interfaces/http/courses/reports.contract';

export type CountVariation = { count: number; arrowDirection: ReportTrend };
export type PorcentialVariation = { percentage: number; arrowDirection: ReportTrend };
