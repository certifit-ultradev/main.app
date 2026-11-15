import { createWompiCheckoutIntegrity } from '@/infrastructure/payments/wompi-integrity';
import { sha256 } from '@/shared/crypto/sha256';

describe('createWompiCheckoutIntegrity', () => {
    it('applies Wompi checkout composition over the shared SHA-256 primitive', async () => {
        await expect(createWompiCheckoutIntegrity('REF-001', 100000, 'key123')).resolves.toBe(
            await sha256('REF-001100000COPkey123'),
        );
    });
});
