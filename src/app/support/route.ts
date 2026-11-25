import { safeLogger } from '@/shared/observability/safe-logger';

const DEFAULT_SUPPORT_MESSAGE = 'Hola, necesito ayuda con Certifit.';
const INTERNATIONAL_PHONE_NUMBER = /^[1-9]\d{7,14}$/;

export async function GET(): Promise<Response> {
    const phoneNumber = process.env.SUPPORT_WHATSAPP_NUMBER?.trim();
    if (!phoneNumber || !INTERNATIONAL_PHONE_NUMBER.test(phoneNumber)) {
        safeLogger.error('support.whatsapp_number.invalid');
        return Response.json(
            { error: 'El canal de soporte no está disponible temporalmente.' },
            { status: 503, headers: { 'Cache-Control': 'no-store' } },
        );
    }

    const destination = new URL(`https://wa.me/${phoneNumber}`);
    destination.searchParams.set('text', process.env.SUPPORT_WHATSAPP_MESSAGE?.trim() || DEFAULT_SUPPORT_MESSAGE);

    return new Response(null, {
        status: 302,
        headers: { Location: destination.toString(), 'Cache-Control': 'no-store' },
    });
}
