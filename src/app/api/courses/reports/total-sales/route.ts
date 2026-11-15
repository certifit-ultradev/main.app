import { toCourseSalesReport } from '@/interfaces/http/courses/reports.contract';
import { calculateTotalSalesPerCourse } from '@/services/courses';
import { reportFailureResponse, reportSuccessResponse } from '../report-api-response';

/**
 * 
 * @returns 
 */
export async function GET() {
    try {
        const result = await calculateTotalSalesPerCourse();
        return reportSuccessResponse(toCourseSalesReport(result));
    } catch (error) {
        return reportFailureResponse(error);
    }
}
