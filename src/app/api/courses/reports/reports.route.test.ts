import { UserNotLoggedError } from '@/exceptions/user-not-logged';
import { EmailUnverifiedError, InsufficientRoleError } from '@/exceptions/actor-access-errors';
import {
    calculateTotalSalesByMonth,
    calculateTotalSalesPerCourse,
    calculateUsersRegisteredByMonth,
} from '@/services/courses';
import { GET as getSales } from '@/src/app/api/courses/reports/total-sales/route';
import { GET as getSalesByMonth } from '@/src/app/api/courses/reports/total-sales-last-month/route';
import { GET as getUsersByMonth } from '@/src/app/api/courses/reports/total-users-last-month/route';

jest.mock('@/services/courses', () => ({
    calculateTotalSalesByMonth: jest.fn(),
    calculateTotalSalesPerCourse: jest.fn(),
    calculateUsersRegisteredByMonth: jest.fn(),
}));

describe('course report routes', () => {
    beforeEach(() => jest.clearAllMocks());

    it('wraps course sales in the public API success contract', async () => {
        (calculateTotalSalesPerCourse as jest.Mock).mockResolvedValue([{ course_name: '1 - Curso', total: 2 }]);

        await expect((await getSales()).json()).resolves.toEqual({ data: [{ course_name: '1 - Curso', total: 2 }] });
    });

    it.each([
        [{ current_month_count: 0, previous_month_count: 0 }, { count: 0, arrowDirection: 'down' }],
        [{ current_month_count: 5, previous_month_count: 0 }, { count: 5, arrowDirection: 'up' }],
        [{ current_month_count: 2, previous_month_count: 5 }, { count: 2, arrowDirection: 'down' }],
    ])('uses one count-report shape for monthly sales %#', async (source, expected) => {
        (calculateTotalSalesByMonth as jest.Mock).mockResolvedValue(source);

        await expect((await getSalesByMonth()).json()).resolves.toEqual({ data: expected });
    });

    it.each([
        [{ current_month_count: 0, previous_month_count: 0 }, { percentage: 0, arrowDirection: 'down' }],
        [{ current_month_count: 7, previous_month_count: 0 }, { percentage: 100, arrowDirection: 'up' }],
        [{ current_month_count: 2, previous_month_count: 4 }, { percentage: 50, arrowDirection: 'down' }],
    ])('uses one percentage-report shape for monthly users %#', async (source, expected) => {
        (calculateUsersRegisteredByMonth as jest.Mock).mockResolvedValue(source);

        await expect((await getUsersByMonth()).json()).resolves.toEqual({ data: expected });
    });

    it('maps an unauthenticated report request to a public failure contract', async () => {
        (calculateTotalSalesPerCourse as jest.Mock).mockRejectedValue(new UserNotLoggedError('Sesión ausente'));

        const response = await getSales();

        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toEqual({
            error: { code: 'UNAUTHENTICATED', message: 'Debes iniciar sesión para consultar los reportes.' },
        });
    });

    it.each([
        [new EmailUnverifiedError(), 'EMAIL_UNVERIFIED'],
        [new InsufficientRoleError(), 'FORBIDDEN'],
    ] as const)('maps authenticated report denial to 403 %#', async (error, code) => {
        (calculateTotalSalesPerCourse as jest.Mock).mockRejectedValue(error);

        const response = await getSales();
        expect(response.status).toBe(403);
        const body = await response.json();
        expect(body).toMatchObject({ error: { code } });
        expect(JSON.stringify(body)).not.toContain('private@example.com');
    });

    it('does not expose an unexpected service error', async () => {
        (calculateUsersRegisteredByMonth as jest.Mock).mockRejectedValue(new Error('connection string leaked'));

        const response = await getUsersByMonth();

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({
            error: { code: 'UNEXPECTED', message: 'No fue posible consultar los reportes.' },
        });
    });
});
