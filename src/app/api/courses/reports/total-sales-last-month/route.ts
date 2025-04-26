import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { calculateTotalSalesByMonth } from '@/services/courses';

export async function GET() {
    try {
        const result = await calculateTotalSalesByMonth();

        if (result.previousMonthCount === 0) {
            return Response.json({
                total: 0,
                arrowDirection: 'up',
            });
        }

        const diff = result.currentMonthCount - result.previousMonthCount;
        const percentageChange = (diff / result.previousMonthCount) * 100;

        const arrowDirection = percentageChange > 0 ? 'up' : 'down';

        return Response.json({
            success: true,
            data: {
                count: result.currentMonthCount,
                arrowDirection,
            }
        });
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
}