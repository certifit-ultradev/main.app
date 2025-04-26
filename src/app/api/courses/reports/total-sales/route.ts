import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { calculateTotalSalesPerCourse} from '@/services/courses';

export async function GET() {
    try {
        const result = await calculateTotalSalesPerCourse();
        return Response.json({
            success: true,
            data: result
        });
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
}