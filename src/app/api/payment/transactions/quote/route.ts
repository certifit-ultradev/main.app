import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { quoteCoursePaymentTransaction } from '@/services/payments';
import { PaymentQuoteRequestSchema, type PaymentQuoteResponse } from '@/interfaces/http/payments/payment.contract';
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
        const command = PaymentQuoteRequestSchema.parse(await parseJsonBody(req));
        const trx = await quoteCoursePaymentTransaction(command);
        const body = {
            purchaseId: trx.purchaseId,
            currency: trx.currency,
            amountInCents: trx.amountInCents,
            reference: trx.reference,
            publicKey: trx.publicKey,
            signature: { integrity: trx.signature.integrity },
            redirectUrl: trx.redirectUrl,
            expirationTime: trx.expirationTime,
        } satisfies PaymentQuoteResponse;
        return Response.json(apiSuccess(body));
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
}
