import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { calculateTotalSalesByMonth } from '@/services/courses';

export async function GET() {
    try {
        const result = await calculateTotalSalesByMonth();

        if (result.previous_month_count === 0) {
            return Response.json({
                total: 0,
                arrowDirection: 'up',
            });
        }

        const diff = result.current_month_count - result.previous_month_count;
        const percentageChange = (diff / result.previous_month_count) * 100;

        const arrowDirection = percentageChange > 0 ? 'up' : 'down';

        return Response.json({
            success: true,
            data: {
                count: result.current_month_count,
                arrowDirection,
            }
        });
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
}