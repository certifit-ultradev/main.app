import { executeService, executeServiceSafe } from '@/utils/service-wrapper';
import { safeLogger } from '@/shared/observability/safe-logger';
import { NotFoundError } from '@/exceptions/not-found';

describe('service-wrapper', () => {
    it('returns a successful operation result', async () => {
        await expect(executeService(async () => 'ok')).resolves.toBe('ok');
    });

    it('rethrows failures without translating them to an HTTP or persistence concern', async () => {
        const error = new Error('database failure');
        await expect(executeService(async () => { throw error; })).rejects.toThrow(error);
    });

    it('logs a failed operation with safe context and preserves the cause', async () => {
        const log = jest.spyOn(safeLogger, 'error').mockImplementation();
        const error = new Error('private database detail');

        await expect(executeService(async () => { throw error; },
            { event: 'service.category.list.failed', metadata: { page: 2 } })).rejects.toBe(error);

        expect(log).toHaveBeenCalledWith('service.category.list.failed', { page: 2 }, error);
        log.mockRestore();
    });

    it('treats an expected missing record as a diagnostic', async () => {
        const debug = jest.spyOn(safeLogger, 'debug').mockImplementation();
        const operational = jest.spyOn(safeLogger, 'error').mockImplementation();
        const error = new NotFoundError('Categoría no encontrada');

        await expect(executeService(async () => { throw error; },
            { event: 'service.category.get_by_id.failed', metadata: { categoryId: 3 } })).rejects.toBe(error);

        expect(debug).toHaveBeenCalledWith('service.category.get_by_id.failed', { categoryId: 3 });
        expect(operational).not.toHaveBeenCalled();
        debug.mockRestore();
        operational.mockRestore();
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
