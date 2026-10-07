import { NextRequest } from 'next/server';
import { sendEmailCourseRequestInfo } from '@/services/email';
import { POST } from '@/src/app/api/courses/[canonicalId]/email/route';
import { NotFoundError } from '@/exceptions/not-found';

jest.mock('@/services/email', () => ({ sendEmailCourseRequestInfo: jest.fn() }));
jest.mock('@/shared/observability/safe-logger', () => ({ safeLogger: { error: jest.fn() } }));

const requestBody = {
    nombre: 'Ada', empresa: 'Analytical Engines', email: 'ada@example.com', telefono: '+57 300 000 0000',
    curso: 'TypeScript', detalles: 'Solicito información.', terminos: true,
};

describe('POST /api/courses/[canonicalId]/email', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns 422 for an invalid request body', async () => {
        const request = new NextRequest('http://localhost/api/courses/course-1/email', {
            method: 'POST', body: JSON.stringify({ ...requestBody, terminos: false }),
        });

        const response = await POST(request, { params: Promise.resolve({ canonicalId: 'course-1' }) });
        expect(response.status).toBe(422);
        await expect(response.json()).resolves.toMatchObject({ error: { code: 'VALIDATION' } });
        expect(sendEmailCourseRequestInfo).not.toHaveBeenCalled();
    });

    it('uses the validated canonical id instead of accepting one from the body', async () => {
        const request = new NextRequest('http://localhost/api/courses/course-1/email', {
            method: 'POST', body: JSON.stringify({ ...requestBody, canonicalId: 'untrusted-course' }),
        });

        const response = await POST(request, { params: Promise.resolve({ canonicalId: 'course-1' }) });
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ data: { message: 'Correo electrónico enviado correctamente.' } });
        expect(sendEmailCourseRequestInfo).toHaveBeenCalledWith(expect.objectContaining({ canonicalId: 'course-1' }));
    });

    it('returns 400 for malformed JSON', async () => {
        const request = new NextRequest('http://localhost/api/courses/course-1/email', { method: 'POST', body: '{' });
        const response = await POST(request, { params: Promise.resolve({ canonicalId: 'course-1' }) });
        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toMatchObject({ error: { code: 'BAD_REQUEST' } });
        expect(sendEmailCourseRequestInfo).not.toHaveBeenCalled();
    });

    it.each([
        [new NotFoundError('private course id'), 404, 'NOT_FOUND'],
        [new Error('private smtp credentials'), 500, 'UNEXPECTED'],
    ])('encodes service failures without exposing details %#', async (error, status, code) => {
        (sendEmailCourseRequestInfo as jest.Mock).mockRejectedValue(error);
        const request = new NextRequest('http://localhost/api/courses/course-1/email', {
            method: 'POST', body: JSON.stringify(requestBody),
        });
        const response = await POST(request, { params: Promise.resolve({ canonicalId: 'course-1' }) });
        expect(response.status).toBe(status);
        const body = await response.json();
        expect(body).toMatchObject({ error: { code } });
        expect(JSON.stringify(body)).not.toContain('private');
        expect(body).not.toHaveProperty('data');
    });
});
