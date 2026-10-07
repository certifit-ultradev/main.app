import { executeService, executeServiceSafe } from '@/utils/service-wrapper';

describe('service-wrapper', () => {
    it('returns a successful operation result', async () => {
        await expect(executeService(async () => 'ok')).resolves.toBe('ok');
    });

    it('rethrows failures without translating them to an HTTP or persistence concern', async () => {
        const error = new Error('database failure');
        await expect(executeService(async () => { throw error; })).rejects.toThrow(error);
    });

    it('propagates failures instead of returning a silent default', async () => {
        const error = new Error('database failure');
        await expect(executeService(async () => { throw error; })).rejects.toThrow(error);
    });

    it('returns a discriminated safe result after a failure', async () => {
        const error = new Error('database failure');
        await expect(executeServiceSafe(async () => { throw error; })).resolves.toEqual({ success: false, error });
    });
});
