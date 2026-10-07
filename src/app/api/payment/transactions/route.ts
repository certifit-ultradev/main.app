import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { createCoursePaymentTransaction } from '@/services/payments';
import { PaymentTransactionRequestSchema, type PaymentTransactionResponse } from '@/interfaces/http/payments/payment.contract';
import { parseJsonBody } from '@/interfaces/http/parse-json-body';
import { NextRequest } from 'next/server';
import { apiSuccess } from '@/interfaces/http/api-response';

/**
 * @param req 
 * @param context 
 * @returns 
 */
export async function POST(req: NextRequest) {
    try {
        const command = PaymentTransactionRequestSchema.parse(await parseJsonBody(req));
        const result = await createCoursePaymentTransaction(command);
        const body = { message: result.message } satisfies PaymentTransactionResponse;
        return Response.json(apiSuccess(body));
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
}
