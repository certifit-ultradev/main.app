import { MalformedJsonError } from '@/exceptions/malformed-json';

/** Parses an HTTP JSON body while preserving the 400/422 boundary for routes. */
export async function parseJsonBody(request: Pick<Request, 'json'>): Promise<unknown> {
    try {
        return await request.json();
    } catch {
        throw new MalformedJsonError();
    }
}
