import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { calculateUsersRegisteredByMonth } from '@/services/courses';

/**
 * @returns 
 */
export async function GET(): Promise<Response> {
    try {
        const result = await calculateUsersRegisteredByMonth();
        if (result.previous_month_count === 0) {
            return Response.json({
                percentage: 100,
                arrowDirection: 'up',
            });
        }

        const diff = result.current_month_count - result.previous_month_count;
        const percentageChange = result.previous_month_count > 0 ? (diff / result.previous_month_count) * 100 : 0;
        const arrowDirection = percentageChange > 0 ? 'up' : 'down';

        return Response.json({
            success: true,
            data: {
                percentage: Math.abs(Math.round(percentageChange)),
                arrowDirection,
            }
        });
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
}