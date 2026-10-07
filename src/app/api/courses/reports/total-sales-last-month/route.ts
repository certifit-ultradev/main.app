import { toCountVariationReport } from '@/interfaces/http/courses/reports.contract';
import { calculateTotalSalesByMonth } from '@/services/courses';
import { reportFailureResponse, reportSuccessResponse } from '../report-api-response';

/**
 * @returns 
 */
export async function GET() {
    try {
        const result = await calculateTotalSalesByMonth();

        return reportSuccessResponse(toCountVariationReport(result));
    } catch (error) {
        return reportFailureResponse(error);
    }
}
