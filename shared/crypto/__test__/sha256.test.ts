import { sha256 } from '@/shared/crypto/sha256';

describe('sha256', () => {
    it('calculates the standard SHA-256 vector without provider semantics', async () => {
        await expect(sha256('abc')).resolves.toBe(
            'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
        );
    });

    it('is deterministic for Unicode input', async () => {
        await expect(sha256('你好世界🌍')).resolves.toBe(await sha256('你好世界🌍'));
    });
});
