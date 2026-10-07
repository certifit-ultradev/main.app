import { NextRequest } from 'next/server';
import { registerModuleFinishtState } from '@/services/courses';
import { NotFoundError } from '@/exceptions/not-found';
import { POST } from '@/src/app/api/courses/module-state/route';

jest.mock('@/services/courses', () => ({ registerModuleFinishtState: jest.fn() }));
jest.mock('@/shared/observability/safe-logger', () => ({ safeLogger: { error: jest.fn() } }));

const command = { canonicalId: 'course-1', moduleId: 2 };
const request = (body: string) => new NextRequest('http://localhost/api/courses/module-state', {
    method: 'POST', body,
});

describe('POST /api/courses/module-state', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns a minimal acknowledgement only after saving', async () => {
        (registerModuleFinishtState as jest.Mock).mockResolvedValue({ success: true });

        const response = await POST(request(JSON.stringify(command)));
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ data: { saved: true } });
        expect(registerModuleFinishtState).toHaveBeenCalledWith('course-1', 2);
    });

    it('does not call the service for an invalid module ID', async () => {
        const response = await POST(request(JSON.stringify({ ...command, moduleId: 0 })));
        expect(response.status).toBe(422);
        expect(registerModuleFinishtState).not.toHaveBeenCalled();
    });

    it('does not acknowledge a failed completion', async () => {
        (registerModuleFinishtState as jest.Mock).mockRejectedValue(new NotFoundError('private'));

        const response = await POST(request(JSON.stringify(command)));
        expect(response.status).toBe(404);
        await expect(response.json()).resolves.toMatchObject({ error: { code: 'NOT_FOUND' } });
    });

    it('does not acknowledge an unsuccessful service result', async () => {
        (registerModuleFinishtState as jest.Mock).mockResolvedValue({ success: false });

        const response = await POST(request(JSON.stringify(command)));
        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toMatchObject({ error: { code: 'UNEXPECTED' } });
    });
});
