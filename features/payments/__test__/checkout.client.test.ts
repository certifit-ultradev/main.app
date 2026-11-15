import {
    CheckoutHttpError,
    parseCheckoutWidgetTransactionId,
    quoteCourseCheckout,
    registerCourseCheckout,
} from '@/features/payments/checkout.client';

const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const quote = {
    purchaseId: 1, currency: 'COP', amountInCents: 10_000, reference: 'ref-1', publicKey: 'pub',
    signature: { integrity: 'hash' }, redirectUrl: 'https://app.example.com/payment-review', expirationTime: 1,
};

describe('checkout HTTP client', () => {
    it('validates the untrusted widget callback before registering a transaction', () => {
        expect(parseCheckoutWidgetTransactionId({ transaction: { id: 'trx-1' } })).toBe('trx-1');
        expect(() => parseCheckoutWidgetTransactionId({ transaction: {} })).toThrow('transacción válida');
        expect(() => parseCheckoutWidgetTransactionId(null)).toThrow('transacción válida');
    });
    it('returns only a validated checkout quote and transaction result', async () => {
        const fetcher = jest.fn()
            .mockResolvedValueOnce(response({ data: quote }))
            .mockResolvedValueOnce(response({ data: { message: 'Pago registrado correctamente.' } }));

        await expect(quoteCourseCheckout('course-1', fetcher)).resolves.toEqual(quote);
        await expect(registerCourseCheckout(1, 'trx-1', fetcher)).resolves.toEqual({ message: 'Pago registrado correctamente.' });
        expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({ canonicalId: 'course-1' });
        expect(JSON.parse(fetcher.mock.calls[1][1].body)).toEqual({ purchaseId: 1, transactionId: 'trx-1' });
    });

    it('rejects legacy, contradictory and malformed success bodies before the widget', async () => {
        for (const body of [
            { success: true, ...quote },
            { data: { ...quote, purchaseId: '1' } },
            { data: quote, error: { code: 'CONFLICT', message: 'conflict' } },
        ]) {
            const fetcher = jest.fn().mockResolvedValue(response(body));
            await expect(quoteCourseCheckout('course-1', fetcher)).rejects.toMatchObject({ status: 502 });
        }
        const transaction = jest.fn().mockResolvedValue(response({ data: { message: 'ok', success: true } }));
        await expect(registerCourseCheckout(1, 'trx-1', transaction)).rejects.toBeInstanceOf(CheckoutHttpError);
    });

    it('exposes only validated public HTTP failures, preserving 409, 422 and gateway errors', async () => {
        const conflict = jest.fn().mockResolvedValue(response({ error: { code: 'CONFLICT', message: 'El curso ya fue comprado.' } }, 409));
        const validation = jest.fn().mockResolvedValue(response({ error: { code: 'VALIDATION', message: 'Datos inválidos.' } }, 422));
        const provider = jest.fn().mockResolvedValue(response({ error: { code: 'BAD_GATEWAY', message: 'No fue posible consultar la transacción. Inténtalo más tarde.' } }, 502));
        const unavailable = jest.fn().mockResolvedValue(response({ error: { code: 'SERVICE_UNAVAILABLE', message: 'No fue posible consultar la transacción. Inténtalo más tarde.' } }, 503));
        await expect(registerCourseCheckout(1, 'trx-1', conflict)).rejects.toMatchObject({ message: 'El curso ya fue comprado.', status: 409 });
        await expect(registerCourseCheckout(1, 'trx-1', validation)).rejects.toMatchObject({ message: 'Datos inválidos.', status: 422 });
        await expect(registerCourseCheckout(1, 'trx-1', provider)).rejects.toMatchObject({ message: 'No fue posible consultar la transacción. Inténtalo más tarde.', status: 502 });
        await expect(registerCourseCheckout(1, 'trx-1', unavailable)).rejects.toMatchObject({ message: 'No fue posible consultar la transacción. Inténtalo más tarde.', status: 503 });
    });

    it('hides malformed errors and internal provider details', async () => {
        const malformed = jest.fn().mockResolvedValue(response({ error: { code: 'PROVIDER', message: 'private token' } }, 500));
        await expect(quoteCourseCheckout('course-1', malformed)).rejects.toMatchObject({ message: 'No fue posible procesar el pago.', status: 500 });
    });

    it('handles non-JSON success and network rejection', async () => {
        const invalidJson = jest.fn().mockResolvedValue(new Response('not-json', { status: 200 }));
        const unavailable = jest.fn().mockRejectedValue(new Error('private gateway host'));
        await expect(quoteCourseCheckout('course-1', invalidJson)).rejects.toMatchObject({ status: 502 });
        await expect(quoteCourseCheckout('course-1', unavailable)).rejects.toMatchObject({ message: 'No fue posible conectar con el servicio de pagos.', status: 0 });
    });

    it('validates request fields before sending', async () => {
        const fetcher = jest.fn();
        await expect(quoteCourseCheckout('', fetcher)).rejects.toThrow();
        await expect(registerCourseCheckout(0, 'trx-1', fetcher)).rejects.toThrow();
        expect(fetcher).not.toHaveBeenCalled();
    });
});
