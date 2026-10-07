export type SafeLogMetadata = Readonly<Record<string, string | number | boolean | undefined>>;

/** Logs stable operational identifiers only; callers must never pass errors, payloads or PII. */
export const safeLogger = {
    error(event: string, metadata: SafeLogMetadata = {}): void {
        const fields = Object.fromEntries(Object.entries(metadata).filter(([, value]) => value !== undefined));
        console.error(JSON.stringify({ level: 'error', event, ...fields }));
    },
};
