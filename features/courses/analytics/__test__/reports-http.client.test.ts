import {
    getCourseSalesReport,
    getMonthlySalesReport,
    getMonthlyUsersReport,
    ReportHttpError,
} from '@/features/courses/analytics/reports-http.client';

const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe('report HTTP client', () => {
    it('returns validated report data from the API success envelope', async () => {
        const fetcher = jest.fn()
            .mockResolvedValueOnce(response({ data: [{ course_name: 'Curso', total: 2 }] }))
            .mockResolvedValueOnce(response({ data: { count: 3, arrowDirection: 'up' } }))
            .mockResolvedValueOnce(response({ data: { percentage: 50, arrowDirection: 'down' } }));

        await expect(getCourseSalesReport(fetcher)).resolves.toEqual([{ course_name: 'Curso', total: 2 }]);
        await expect(getMonthlySalesReport(fetcher)).resolves.toEqual({ count: 3, arrowDirection: 'up' });
        await expect(getMonthlyUsersReport(fetcher)).resolves.toEqual({ percentage: 50, arrowDirection: 'down' });
    });

    it('rejects a malformed successful payload before UI state can consume it', async () => {
        const fetcher = jest.fn().mockResolvedValue(response({ data: { count: 'three', arrowDirection: 'up' } }));

        await expect(getMonthlySalesReport(fetcher)).rejects.toBeInstanceOf(ReportHttpError);
    });

    it('preserves a public API failure message', async () => {
        const fetcher = jest.fn().mockResolvedValue(response({ error: { code: 'UNAUTHENTICATED', message: 'Inicia sesión' } }, 401));

        await expect(getCourseSalesReport(fetcher)).rejects.toMatchObject({ message: 'Inicia sesión', status: 401 });
    });
});
