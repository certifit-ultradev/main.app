import { toPercentageVariationReport } from '@/interfaces/http/courses/reports.contract';
import { calculateUsersRegisteredByMonth } from '@/services/courses';
import { reportFailureResponse, reportSuccessResponse } from '../report-api-response';

/**
 * @returns 
 */
export async function GET(): Promise<Response> {
    try {
        const result = await calculateUsersRegisteredByMonth();
        return reportSuccessResponse(toPercentageVariationReport(result));
    } catch (error) {
        return reportFailureResponse(error);
    }
}
