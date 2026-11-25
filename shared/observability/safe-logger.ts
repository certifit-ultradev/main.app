import { getPrismaTransactionFailureReason, getSafePrismaErrorCode } from './prisma-error-code';

export type SafeLogMetadata = Readonly<Record<string, string | number | boolean | undefined>>;
export type SafeLogLevel = 'debug' | 'info' | 'warn' | 'error';

const severity: Record<SafeLogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const recentlyLoggedErrors = new WeakMap<object, number>();
const duplicateWindowMs = 1_000;

function minimumLevel(): SafeLogLevel {
    const configured = process.env.CERTIFIT_LOG_LEVEL;
    if (configured === 'debug' || configured === 'info' || configured === 'warn' || configured === 'error') {
        return configured;
    }
    return process.env.NODE_ENV === 'production' ? 'warn' : 'info';
}

function safeErrorFields(cause: unknown): SafeLogMetadata {
    const rawName = cause instanceof Error ? cause.name : undefined;
    const name = rawName && /^[A-Za-z][A-Za-z0-9]{0,63}$/.test(rawName) ? rawName : 'unknown';
    const code = getSafePrismaErrorCode(cause);
    return {
        name,
        code,
        ...(code === 'P2028' ? { reason: getPrismaTransactionFailureReason(cause) } : {}),
    };
}

function write(level: SafeLogLevel, event: string, metadata: SafeLogMetadata, cause?: unknown): void {
    // This module is shared by server and client bundles; operational logs belong on the server.
    if (typeof window !== 'undefined' || severity[level] < severity[minimumLevel()]) return;
    if (level === 'error' && typeof cause === 'object' && cause !== null) {
        const now = Date.now();
        const previous = recentlyLoggedErrors.get(cause);
        if (previous !== undefined && now - previous < duplicateWindowMs) return;
        recentlyLoggedErrors.set(cause, now);
    }
    const fields = Object.fromEntries(Object.entries(metadata).filter(([, value]) => value !== undefined));
    const entry = JSON.stringify({ ...fields, ...(cause === undefined ? {} : safeErrorFields(cause)), level, event });
    if (level === 'error') console.error(entry);
    else if (level === 'warn') console.warn(entry);
    else if (level === 'info') console.info(entry);
    else console.debug(entry);
}

/** Logs only stable IDs, bounded classifications and operational metadata, never payloads or error messages. */
export const safeLogger = {
    debug(event: string, metadata: SafeLogMetadata = {}, cause?: unknown): void { write('debug', event, metadata, cause); },
    info(event: string, metadata: SafeLogMetadata = {}, cause?: unknown): void { write('info', event, metadata, cause); },
    warn(event: string, metadata: SafeLogMetadata = {}, cause?: unknown): void { write('warn', event, metadata, cause); },
    error(event: string, metadata: SafeLogMetadata = {}, cause?: unknown): void { write('error', event, metadata, cause); },
};
