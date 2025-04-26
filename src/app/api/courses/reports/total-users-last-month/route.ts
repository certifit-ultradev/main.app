import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { calculateUsersRegisteredByMonth } from '@/services/courses';

export async function GET(): Promise<Response> {
    try {
        const result = await calculateUsersRegisteredByMonth();
        if (result.previousMonthCount === 0) {
            return Response.json({
                percentage: 100,
                arrowDirection: 'up',
            });
        }

        const diff = result.currentMonthCount - result.previousMonthCount;
        const percentageChange = (diff / result.previousMonthCount) * 100;
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