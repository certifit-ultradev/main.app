import { updateCoursePaymentTransaction } from '@/services/payments';
import { getServerEnv } from '@/config/env';
import { NextRequest } from 'next/server';
import { parseWompiWebhook, toApplyPaymentEventCommand, verifyWompiWebhook } from '@/infrastructure/payments/wompi-webhook';
import { parseJsonBody } from '@/interfaces/http/parse-json-body';
import { MalformedJsonError } from '@/exceptions/malformed-json';
import { z } from 'zod';
import type { ApplyPaymentEventResult } from '@/application/payments/payment.dto';

const SIGNATURE_HEADER = 'X-Event-Checksum'

const acknowledgementMessages: Record<ApplyPaymentEventResult['outcome'], string> = {
    applied: 'Actualización del pago registrado correctamente.',
    already_applied: 'Evento de pago ya aplicado.',
};

/**
 * 
 * @param req 
 * @returns 
 */
export async function POST(req: NextRequest) {
    try {
        const eventKey = getServerEnv().WOMPI_EVENT_KEY;
        if (!eventKey) return Response.json({ success: false, message: 'Configuración de webhook incompleta' }, { status: 500 });
        const event = parseWompiWebhook(await parseJsonBody(req));
        const valid = await verifyWompiWebhook(event, req.headers.get(SIGNATURE_HEADER), eventKey);
        // Invalid signatures are permanent client errors and must not be retried.
        if (!valid) return Response.json({ success: false, message: 'Evento no válido' }, { status: 400 });
        const result = await updateCoursePaymentTransaction(toApplyPaymentEventCommand(event));

        return Response.json({ success: true, message: acknowledgementMessages[result.outcome] });
    } catch (error) {
        if (error instanceof SyntaxError || error instanceof MalformedJsonError) return Response.json({ success: false, message: 'JSON inválido' }, { status: 400 });
        if (error instanceof z.ZodError) return Response.json({ success: false, message: 'Payload inválido' }, { status: 422 });
        return Response.json({
            success: false,
            message: "Error al procesar el evento"
        }, { status: 500 });
    }
}
