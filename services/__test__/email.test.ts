import { sendEmailCourseRequestInfo } from '@/services/email';
import { nodemailerEmailGateway } from '@/infrastructure/notifications/nodemailer-email-gateway';

jest.mock('@/infrastructure/notifications/nodemailer-email-gateway', () => ({
    nodemailerEmailGateway: { sendCourseInformationRequest: jest.fn() },
}));

describe('course information email service', () => {
    it('delegates the application command to its notification port', async () => {
        const command = {
            canonicalId: 'curso-1', nombre: 'Ana', empresa: 'ACME', email: 'ana@example.com',
            telefono: '123', curso: 'TypeScript', detalles: 'Información', terminos: true,
        };

        await sendEmailCourseRequestInfo(command);

        expect(nodemailerEmailGateway.sendCourseInformationRequest).toHaveBeenCalledWith(command);
    });
});
