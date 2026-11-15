import { sha256 } from '@/shared/crypto/sha256';
import { parseWompiWebhook, verifyWompiWebhook } from '@/infrastructure/payments/wompi-webhook';

const payload = {
    data: {
        transaction: {
            id: 'trx-1', reference: 'ref-1', status: 'APPROVED', payment_method_type: 'CARD',
            created_at: '2026-01-01T00:00:00.000Z', amount_in_cents: 120000, currency: 'COP',
        },
    },
    signature: { properties: ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'] },
    timestamp: 1704067200,
};

describe('Wompi webhook adapter', () => {
    it('verifies a checksum using only permitted transaction paths', async () => {
        const event = parseWompiWebhook(payload);
        const checksum = await sha256('trx-1APPROVED1200001704067200event-key');

        await expect(verifyWompiWebhook(event, checksum, 'event-key')).resolves.toBe(true);
    });

    it('rejects an invalid checksum or a configured path whose value is absent', async () => {
        const event = parseWompiWebhook(payload);
        await expect(verifyWompiWebhook(event, 'invalid', 'event-key')).resolves.toBe(false);

        const withoutAmount = parseWompiWebhook({
            ...payload,
            data: { transaction: { ...payload.data.transaction, amount_in_cents: undefined } },
        });
        await expect(verifyWompiWebhook(withoutAmount, 'checksum', 'event-key')).resolves.toBe(false);
    });

    it('rejects provider paths outside the supported signature allowlist', () => {
        expect(() => parseWompiWebhook({
            ...payload,
            signature: { properties: ['transaction.customer_email'] },
        })).toThrow();
    });
});
