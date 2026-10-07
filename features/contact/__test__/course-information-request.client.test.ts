import {
    CourseInformationRequestError,
    sendCourseInformationRequest,
} from '@/features/contact/course-information-request.client';

const requestValues = {
    nombre: 'Ada', empresa: 'Certifit', email: 'ada@example.com', telefono: '573001234567',
    curso: 'course-1', detalles: 'Quiero más información', terminos: true,
};
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe('course information request client', () => {
    it('accepts only a validated successful response', async () => {
        const fetcher = jest.fn().mockResolvedValue(response({ data: { message: 'Correo enviado.' } }));

        await expect(sendCourseInformationRequest('course-1', requestValues, fetcher)).resolves.toBeUndefined();
    });

    it('rejects malformed and failed responses before the form treats them as success', async () => {
        const malformed = jest.fn().mockResolvedValue(response({ success: true, message: 'Correo enviado.' }));
        const failed = jest.fn().mockResolvedValue(response({ error: { code: 'VALIDATION', message: 'Datos inválidos' } }, 422));

        await expect(sendCourseInformationRequest('course-1', requestValues, malformed)).rejects.toBeInstanceOf(CourseInformationRequestError);
        await expect(sendCourseInformationRequest('course-1', requestValues, failed)).rejects.toThrow('Datos inválidos');
    });

    it('rejects contradictory, non-JSON and network responses without treating them as success', async () => {
        const both = jest.fn().mockResolvedValue(response({ data: { message: 'ok' }, error: { code: 'CONFLICT', message: 'x' } }));
        const nonJson = jest.fn().mockResolvedValue(new Response('not-json', { status: 200 }));
        const network = jest.fn().mockRejectedValue(new Error('private host'));
        await expect(sendCourseInformationRequest('course-1', requestValues, both)).rejects.toThrow('formato esperado');
        await expect(sendCourseInformationRequest('course-1', requestValues, nonJson)).rejects.toThrow('formato esperado');
        await expect(sendCourseInformationRequest('course-1', requestValues, network)).rejects.toThrow('No fue posible conectar');
    });

    it('hides malformed HTTP failures rather than displaying arbitrary server data', async () => {
        const failed = jest.fn().mockResolvedValue(response({ error: { message: 'private smtp token' } }, 500));
        await expect(sendCourseInformationRequest('course-1', requestValues, failed)).rejects.toThrow('No fue posible enviar la solicitud.');
    });
});
