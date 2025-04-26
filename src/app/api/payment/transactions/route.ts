import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { createCoursePaymentTransaction } from '@/services/payments';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const request = await req.json();
        const {purchaseId, id}  = request;
        const result = await createCoursePaymentTransaction(purchaseId, id);
        return Response.json(result);
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
}