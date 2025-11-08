import { logPrismaError } from "@/exceptions/error-encoder";
import { UserNotLoggedError } from "@/exceptions/user-not-logged";
import {
    countCourseSales,
    sumCourseSalesByLastMonth,
    sumUsersByLastMonth
} from "@/repository/courses";
import {
    calculateTotalSalesPerCourse,
    calculateTotalSalesByMonth,
    calculateUsersRegisteredByMonth
} from '@/services/courses';
import { auth } from "@/auth";
import { mockSession, setupMocks, clearAllMocks } from './setup';

jest.mock('@/repository/courses');
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

            (countCourseSales as jest.Mock).mockResolvedValue(mockSalesData);

            const result = await calculateTotalSalesPerCourse();

            expect(result).toEqual(mockSalesData);
            expect(countCourseSales).toHaveBeenCalled();
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

            (sumCourseSalesByLastMonth as jest.Mock).mockResolvedValue(mockMonthSales);

            const result = await calculateTotalSalesByMonth();

            expect(result).toEqual(mockMonthSales);
            expect(sumCourseSalesByLastMonth).toHaveBeenCalled();
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

            (sumUsersByLastMonth as jest.Mock).mockResolvedValue(mockUserStats);

            const result = await calculateUsersRegisteredByMonth();

            expect(result).toEqual(mockUserStats);
            expect(sumUsersByLastMonth).toHaveBeenCalled();
        });

        test('debería lanzar error si el usuario no está logueado', async () => {
            (auth as jest.Mock).mockResolvedValue(null);

            await expect(calculateUsersRegisteredByMonth())
                .rejects
                .toThrow(UserNotLoggedError);
        });
    });
});
