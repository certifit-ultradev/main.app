import { NextRequest } from 'next/server';
import { registerClassCurrentState } from '@/services/courses';
import { CourseNotPurchasedError } from '@/exceptions/course-not-purchased';
import { POST } from '@/src/app/api/courses/class-state/route';

jest.mock('@/services/courses', () => ({ registerClassCurrentState: jest.fn() }));
jest.mock('@/shared/observability/safe-logger', () => ({ safeLogger: { error: jest.fn() } }));

const command = { canonicalId: 'course-1', classId: 2, currentTime: 12, isCompleted: true };
const request = (body: string) => new NextRequest('http://localhost/api/courses/class-state', {
    method: 'POST', body,
});

describe('POST /api/courses/class-state', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns an acknowledgement only after the service saves progress', async () => {
        (registerClassCurrentState as jest.Mock).mockResolvedValue({ success: true });

        const response = await POST(request(JSON.stringify(command)));
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ data: { saved: true } });
        expect(registerClassCurrentState).toHaveBeenCalledWith('course-1', 2, 12, true);
    });

    it.each([
        ['{', 400],
        [JSON.stringify({ ...command, currentTime: -1 }), 422],
    ])('rejects malformed input before saving', async (body, status) => {
        const response = await POST(request(body));
        expect(response.status).toBe(status);
        expect(registerClassCurrentState).not.toHaveBeenCalled();
        await expect(response.json()).resolves.toMatchObject({ error: { code: expect.any(String) } });
    });

    it('does not acknowledge failed enrollment checks', async () => {
        (registerClassCurrentState as jest.Mock).mockRejectedValue(new CourseNotPurchasedError('private'));

        const response = await POST(request(JSON.stringify(command)));
        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toMatchObject({ error: { code: 'FORBIDDEN' } });
    });

    it('does not acknowledge an unsuccessful service result', async () => {
        (registerClassCurrentState as jest.Mock).mockResolvedValue({ success: false });

        const response = await POST(request(JSON.stringify(command)));
        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toMatchObject({ error: { code: 'UNEXPECTED' } });
    });
});
