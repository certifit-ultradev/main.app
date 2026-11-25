import { safeLogger } from '@/shared/observability/safe-logger';

describe('safeLogger', () => {
    const originalLevel = process.env.CERTIFIT_LOG_LEVEL;
    const originalNodeEnv = process.env.NODE_ENV;
    const writableEnv: Record<string, string | undefined> = process.env;

    afterEach(() => {
        jest.restoreAllMocks();
        if (originalLevel === undefined) delete process.env.CERTIFIT_LOG_LEVEL;
        else process.env.CERTIFIT_LOG_LEVEL = originalLevel;
        writableEnv.NODE_ENV = originalNodeEnv;
    });

    it('shows warnings and errors by default in production', () => {
        delete process.env.CERTIFIT_LOG_LEVEL;
        writableEnv.NODE_ENV = 'production';
        const debug = jest.spyOn(console, 'debug').mockImplementation();
        const info = jest.spyOn(console, 'info').mockImplementation();
        const warn = jest.spyOn(console, 'warn').mockImplementation();
        const error = jest.spyOn(console, 'error').mockImplementation();

        safeLogger.debug('diagnostic');
        safeLogger.info('normal');
        safeLogger.warn('degraded', { courseId: 7 });
        safeLogger.error('failed', { courseId: 7 });

        expect(debug).not.toHaveBeenCalled();
        expect(info).not.toHaveBeenCalled();
        expect(JSON.parse(warn.mock.calls[0][0])).toEqual({ courseId: 7, level: 'warn', event: 'degraded' });
        expect(JSON.parse(error.mock.calls[0][0])).toEqual({ courseId: 7, level: 'error', event: 'failed' });
    });

    it('enables diagnostics explicitly and never serializes the raw cause', () => {
        process.env.CERTIFIT_LOG_LEVEL = 'debug';
        const debug = jest.spyOn(console, 'debug').mockImplementation();
        const error = jest.spyOn(console, 'error').mockImplementation();
        const cause = Object.assign(new Error('private@example.com'), {
            name: 'PrismaClientKnownRequestError',
            code: 'P2028',
            meta: { error: 'Transaction expired for private@example.com' },
        });

        safeLogger.debug('course.content.started', { courseId: 7 });
        safeLogger.error('course.content.persistence_failed', { courseId: 7, phase: 'load_course' }, cause);

        expect(debug).toHaveBeenCalledTimes(1);
        const serialized = error.mock.calls[0][0];
        expect(JSON.parse(serialized)).toEqual({
            courseId: 7, phase: 'load_course', name: 'PrismaClientKnownRequestError',
            code: 'P2028', reason: 'expired', level: 'error', event: 'course.content.persistence_failed',
        });
        expect(serialized).not.toContain('private@example.com');
    });

    it('logs a rethrown error once while allowing different failures', () => {
        process.env.CERTIFIT_LOG_LEVEL = 'error';
        const errorSink = jest.spyOn(console, 'error').mockImplementation();
        const cause = new Error('sensitive');

        safeLogger.error('repository.failed', { courseId: 7 }, cause);
        safeLogger.error('service.failed', { courseId: 7 }, cause);
        safeLogger.error('repository.failed', { courseId: 8 }, new Error('other'));

        expect(errorSink).toHaveBeenCalledTimes(2);
        expect(JSON.parse(errorSink.mock.calls[0][0]).event).toBe('repository.failed');
        expect(JSON.parse(errorSink.mock.calls[1][0]).courseId).toBe(8);
    });
});
