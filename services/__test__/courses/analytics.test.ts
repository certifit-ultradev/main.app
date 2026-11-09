import { logPrismaError } from "@/exceptions/error-encoder";
import { UserNotLoggedError } from "@/exceptions/user-not-logged";
import { prismaCourseAnalyticsReadPort } from '@/repository/course-analytics.prisma';
import {
    calculateTotalSalesPerCourse,
    calculateTotalSalesByMonth,
    calculateUsersRegisteredByMonth
} from '@/services/courses';
import { auth } from "@/auth";
import { mockSession, setupMocks, clearAllMocks } from './setup';

jest.mock('@/repository/course-analytics.prisma', () => ({
    prismaCourseAnalyticsReadPort: {
        findSalesByCourse: jest.fn(),
        findApprovedSalesByMonth: jest.fn(),
        findRegisteredUsersByMonth: jest.fn(),
    },
}));
jest.mock('@/exceptions/error-encoder');
jest.mock('@/auth');

describe('Courses Service - Analytics', () => {
    beforeEach(() => {
        setupMocks(logPrismaError as jest.Mock, auth as jest.Mock);
    });

    afterEach(() => {
        clearAllMocks();
    });

    describe('calculateTotalSalesPerCourse', () => {
        test('debería retornar las ventas totales por curso', async () => {
            const mockSalesData = [
                { courseId: 1, courseName: 'Curso 1', totalSales: 100 },
                { courseId: 2, courseName: 'Curso 2', totalSales: 200 }
            ];

            (prismaCourseAnalyticsReadPort.findSalesByCourse as jest.Mock).mockResolvedValue(mockSalesData);

            const result = await calculateTotalSalesPerCourse();

            expect(result).toEqual(mockSalesData);
            expect(prismaCourseAnalyticsReadPort.findSalesByCourse).toHaveBeenCalled();
        });

        test('debería lanzar error si el usuario no está logueado', async () => {
            (auth as jest.Mock).mockResolvedValue(null);

            await expect(calculateTotalSalesPerCourse())
                .rejects
                .toThrow(UserNotLoggedError);
        });
    });

    describe('calculateTotalSalesByMonth', () => {
        test('debería retornar las ventas totales del último mes', async () => {
            const mockMonthSales = {
                currentMonth: 1500,
                lastMonth: 1200,
                percentageChange: 25
            };

            (prismaCourseAnalyticsReadPort.findApprovedSalesByMonth as jest.Mock).mockResolvedValue(mockMonthSales);

            const result = await calculateTotalSalesByMonth();

            expect(result).toEqual(mockMonthSales);
            expect(prismaCourseAnalyticsReadPort.findApprovedSalesByMonth).toHaveBeenCalled();
        });

        test('debería lanzar error si el usuario no está logueado', async () => {
            (auth as jest.Mock).mockResolvedValue(null);

            await expect(calculateTotalSalesByMonth())
                .rejects
                .toThrow(UserNotLoggedError);
        });
    });

    describe('calculateUsersRegisteredByMonth', () => {
        test('debería retornar los usuarios registrados por mes', async () => {
            const mockUserStats = {
                currentMonth: 50,
                lastMonth: 40,
                percentageChange: 25
            };

            (prismaCourseAnalyticsReadPort.findRegisteredUsersByMonth as jest.Mock).mockResolvedValue(mockUserStats);

            const result = await calculateUsersRegisteredByMonth();

            expect(result).toEqual(mockUserStats);
            expect(prismaCourseAnalyticsReadPort.findRegisteredUsersByMonth).toHaveBeenCalled();
        });

        test('debería lanzar error si el usuario no está logueado', async () => {
            (auth as jest.Mock).mockResolvedValue(null);

            await expect(calculateUsersRegisteredByMonth())
                .rejects
                .toThrow(UserNotLoggedError);
        });
    });
});
