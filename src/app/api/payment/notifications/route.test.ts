import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getServerEnv } from '@/config/env';
import { parseWompiWebhook, verifyWompiWebhook } from '@/infrastructure/payments/wompi-webhook';
import { updateCoursePaymentTransaction } from '@/services/payments';
import { POST } from '@/src/app/api/payment/notifications/route';

jest.mock('@/config/env', () => ({ getServerEnv: jest.fn() }));
jest.mock('@/services/payments', () => ({ updateCoursePaymentTransaction: jest.fn() }));
jest.mock('@/infrastructure/payments/wompi-webhook', () => ({
    parseWompiWebhook: jest.fn((value) => value),
    verifyWompiWebhook: jest.fn(),
    toApplyPaymentEventCommand: jest.fn(() => ({ transactionId: 'trx-1', reference: 'ref-1', status: 'APPROVED', paymentMethod: 'CARD', occurredAt: new Date() })),
}));

const payload = { data: { transaction: { id: 'trx-1', reference: 'ref-1', status: 'APPROVED', payment_method_type: 'CARD', created_at: new Date().toISOString() } }, signature: { properties: ['transaction.id'] }, timestamp: 1 };
const request = (body = JSON.stringify(payload)) => new NextRequest('http://localhost/api/payment/notifications', {
    method: 'POST', headers: { 'X-Event-Checksum': 'checksum' }, body,
});

describe('POST /api/payment/notifications', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (getServerEnv as jest.Mock).mockReturnValue({ WOMPI_EVENT_KEY: 'key' });
        (parseWompiWebhook as jest.Mock).mockImplementation((value) => value);
    });
    it('maps a verified provider event to an internal payment command', async () => {
        (verifyWompiWebhook as jest.Mock).mockResolvedValue(true);
        (updateCoursePaymentTransaction as jest.Mock).mockResolvedValue({ outcome: 'applied' });
        const response = await POST(request());
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ success: true, message: 'Actualización del pago registrado correctamente.' });
        expect(updateCoursePaymentTransaction).toHaveBeenCalledWith(expect.objectContaining({ transactionId: 'trx-1', status: 'APPROVED' }));
    });
    it('acknowledges a replay with the same provider protocol without reprocessing it', async () => {
        (verifyWompiWebhook as jest.Mock).mockResolvedValue(true);
        (updateCoursePaymentTransaction as jest.Mock).mockResolvedValue({ outcome: 'already_applied' });

        const response = await POST(request());

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ success: true, message: 'Evento de pago ya aplicado.' });
        expect(updateCoursePaymentTransaction).toHaveBeenCalledTimes(1);
    });
    it('returns 400 and does not update a purchase for an invalid signature', async () => {
        (verifyWompiWebhook as jest.Mock).mockResolvedValue(false);
        const response = await POST(request());
        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({ success: false, message: 'Evento no válido' });
        expect(updateCoursePaymentTransaction).not.toHaveBeenCalled();
    });
    it('returns 400 and does not apply an event for malformed JSON', async () => {
        const response = await POST(request('{'));

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({ success: false, message: 'JSON inválido' });
        expect(parseWompiWebhook).not.toHaveBeenCalled();
        expect(updateCoursePaymentTransaction).not.toHaveBeenCalled();
    });
    it('returns 422 and does not apply an event with an invalid provider payload', async () => {
        (parseWompiWebhook as jest.Mock).mockImplementation(() => {
            throw new z.ZodError([]);
        });

        const response = await POST(request());

        expect(response.status).toBe(422);
        await expect(response.json()).resolves.toEqual({ success: false, message: 'Payload inválido' });
        expect(verifyWompiWebhook).not.toHaveBeenCalled();
        expect(updateCoursePaymentTransaction).not.toHaveBeenCalled();
    });
    it('returns 500 when the mandatory event key is unavailable', async () => {
        (getServerEnv as jest.Mock).mockReturnValue({});
        const response = await POST(request());
        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({ success: false, message: 'Configuración de webhook incompleta' });
    });

    it('returns a generic 500 when payment processing fails', async () => {
        (verifyWompiWebhook as jest.Mock).mockResolvedValue(true);
        (updateCoursePaymentTransaction as jest.Mock).mockRejectedValue(new Error('private provider payload'));
        const response = await POST(request());
        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({ success: false, message: 'Error al procesar el evento' });
    });
});
