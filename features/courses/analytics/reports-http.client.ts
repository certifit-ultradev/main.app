import { z } from 'zod';
import type {
    CountVariationReportDto,
    CourseSalesReportDto,
    PercentageVariationReportDto,
} from '@/interfaces/http/courses/reports.contract';

type Fetcher = typeof fetch;

const ApiErrorSchema = z.object({ error: z.object({ code: z.string(), message: z.string() }) });
const CourseSalesSchema = z.object({ course_name: z.string(), total: z.number().finite() });
const CountVariationSchema = z.object({ count: z.number().finite(), arrowDirection: z.enum(['up', 'down']) });
const PercentageVariationSchema = z.object({ percentage: z.number().finite(), arrowDirection: z.enum(['up', 'down']) });

export class ReportHttpError extends Error {
    constructor(message: string, readonly status: number) {
        super(message);
        this.name = 'ReportHttpError';
    }
}

async function requestReport<T>(path: string, schema: z.ZodType<T>, fetcher: Fetcher): Promise<T> {
    const response = await fetcher(path, { method: 'GET' });
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
        const error = ApiErrorSchema.safeParse(payload);
        throw new ReportHttpError(error.success ? error.data.error.message : 'No fue posible consultar los reportes.', response.status);
    }

    const envelope = z.object({ data: z.unknown() }).safeParse(payload);
    if (!envelope.success) throw new ReportHttpError('La respuesta de reportes no tiene el formato esperado.', response.status);
    const parsed = schema.safeParse(envelope.data.data);
    if (!parsed.success) throw new ReportHttpError('La respuesta de reportes no tiene el formato esperado.', response.status);
    return parsed.data;
}

export const getCourseSalesReport = (fetcher: Fetcher = fetch): Promise<CourseSalesReportDto[]> =>
    requestReport('/api/courses/reports/total-sales', CourseSalesSchema.array(), fetcher);

export const getMonthlySalesReport = (fetcher: Fetcher = fetch): Promise<CountVariationReportDto> =>
    requestReport('/api/courses/reports/total-sales-last-month', CountVariationSchema, fetcher);

export const getMonthlyUsersReport = (fetcher: Fetcher = fetch): Promise<PercentageVariationReportDto> =>
    requestReport('/api/courses/reports/total-users-last-month', PercentageVariationSchema, fetcher);
