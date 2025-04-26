import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { quoteCoursePaymentTransaction } from '@/services/payments';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const request = await req.json();
        const { courseCanonicalId } = request;
        const trx = await quoteCoursePaymentTransaction(courseCanonicalId);
        return Response.json({
            success: true,
            ...trx
        });
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
}