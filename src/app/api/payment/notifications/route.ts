import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { updateCoursePaymentTransaction } from '@/services/payments';
import { verifyEventSignature } from '@/utils/signature';
import { NextRequest } from 'next/server';

const SIGNATURE_HEADER = 'X-Event-Checksum'

const eventKey = process.env.WOMPI_EVENT_KEY;

export async function POST(req: NextRequest) {
    try {
        const request = await req.json();
        const { data, signature } = request;
        const headers = req.headers;

        const eventSignature = await verifyEventSignature({ ...data, properties: signature.properties }, request.timestamp, eventKey);
        if (eventSignature !== headers.get(SIGNATURE_HEADER)) {
            return Response.json({
                success:false,
                message:"el evento no es válido"
            });
        }

        const result = await updateCoursePaymentTransaction(data.transaction);

        return Response.json(result);
    } catch (error) {
        console.error(mapErrorToAPIResponse(error));
        return null;
    }
}