import { GET } from '@/src/app/support/route';
import { safeLogger } from '@/shared/observability/safe-logger';

jest.mock('@/shared/observability/safe-logger', () => ({ safeLogger: { error: jest.fn() } }));

const originalNumber = process.env.SUPPORT_WHATSAPP_NUMBER;
const originalMessage = process.env.SUPPORT_WHATSAPP_MESSAGE;

afterEach(() => {
    if (originalNumber === undefined) delete process.env.SUPPORT_WHATSAPP_NUMBER;
    else process.env.SUPPORT_WHATSAPP_NUMBER = originalNumber;
    if (originalMessage === undefined) delete process.env.SUPPORT_WHATSAPP_MESSAGE;
    else process.env.SUPPORT_WHATSAPP_MESSAGE = originalMessage;
    jest.clearAllMocks();
});

describe('GET /support', () => {
    it('redirects to WhatsApp with the configured number and a prefilled message', async () => {
        process.env.SUPPORT_WHATSAPP_NUMBER = '573001234567';
        process.env.SUPPORT_WHATSAPP_MESSAGE = 'Hola, necesito ayuda con mi curso de Certifit.';

        const response = await GET();
        const destination = new URL(response.headers.get('Location') ?? '');

        expect(response.status).toBe(302);
        expect(response.headers.get('Cache-Control')).toBe('no-store');
        expect(destination.origin).toBe('https://wa.me');
        expect(destination.pathname).toBe('/573001234567');
        expect(destination.searchParams.get('text')).toBe('Hola, necesito ayuda con mi curso de Certifit.');
    });

    it('uses the default message when none is configured', async () => {
        process.env.SUPPORT_WHATSAPP_NUMBER = '573001234567';
        delete process.env.SUPPORT_WHATSAPP_MESSAGE;

        const response = await GET();
        const destination = new URL(response.headers.get('Location') ?? '');

        expect(destination.searchParams.get('text')).toBe('Hola, necesito ayuda con Certifit.');
    });

    it.each(['', '+573001234567', '57300/evil', '573001234567?text=otro'])('rejects an invalid number: %s', async (number) => {
        process.env.SUPPORT_WHATSAPP_NUMBER = number;

        const response = await GET();

        expect(response.status).toBe(503);
        expect(response.headers.get('Location')).toBeNull();
        expect(safeLogger.error).toHaveBeenCalledWith('support.whatsapp_number.invalid');
    });
});
