/** Prisma errors can cross module boundaries where `instanceof` is unreliable. */
export function getSafePrismaErrorCode(error: unknown): string | undefined {
    if (typeof error !== 'object' || error === null || !('code' in error)) return undefined;
    const code = error.code;
    return typeof code === 'string' && /^P\d{4}$/.test(code) ? code : undefined;
}

/** Classifies P2028 without ever logging Prisma's raw metadata. */
export function getPrismaTransactionFailureReason(error: unknown): 'expired' | 'start_failed' | 'closed' | 'other' | 'unknown' {
    if (typeof error !== 'object' || error === null || !('meta' in error)) return 'unknown';
    const meta = error.meta;
    if (typeof meta !== 'object' || meta === null || !('error' in meta) || typeof meta.error !== 'string') return 'unknown';
    if (/expired|timeout|timed out/i.test(meta.error)) return 'expired';
    if (/start/i.test(meta.error)) return 'start_failed';
    if (/closed/i.test(meta.error)) return 'closed';
    return 'other';
}
