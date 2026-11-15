import { nodemailerEmailGateway } from '@/infrastructure/notifications/nodemailer-email-gateway';
import { createNodemailerTransporter } from '@/infrastructure/notifications/nodemailer-transporter';
import { getPublicAppUrl, getServerEnv } from '@/config/env';

jest.mock('@/infrastructure/notifications/nodemailer-transporter', () => ({ createNodemailerTransporter: jest.fn() }));
jest.mock('@/config/env', () => ({ getPublicAppUrl: jest.fn(), getServerEnv: jest.fn() }));

describe('Nodemailer email gateway', () => {
    const sendMail = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (createNodemailerTransporter as jest.Mock).mockResolvedValue({ sendMail });
        (getPublicAppUrl as jest.Mock).mockReturnValue('https://app.example.com');
        (getServerEnv as jest.Mock).mockReturnValue({ FROM_EMAIL: 'no-reply@example.com' });
    });

    it('envía enlaces de restablecimiento y verificación sin revelar SMTP al puerto', async () => {
        await nodemailerEmailGateway.sendPasswordResetLink({ email: 'user@example.com', token: 'reset token' });
        await nodemailerEmailGateway.sendVerificationLink({ email: 'user@example.com', token: 'verify token' });

        expect(sendMail).toHaveBeenNthCalledWith(1, expect.objectContaining({
            to: 'user@example.com',
            html: expect.stringContaining('reset%20token'),
        }));
        expect(sendMail).toHaveBeenNthCalledWith(2, expect.objectContaining({
            to: 'user@example.com',
            html: expect.stringContaining('verify%20token'),
        }));
    });

    it('escapa datos de solicitudes de curso antes de incluirlos en HTML', async () => {
        await nodemailerEmailGateway.sendCourseInformationRequest({
            canonicalId: 'curso-1', nombre: '<script>', empresa: 'ACME', email: 'user@example.com',
            telefono: '123', curso: 'Curso', detalles: 'A&B', terminos: true,
        });

        expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
            to: 'certifit.ultra@gmail.com',
            html: expect.stringContaining('&lt;script&gt;'),
        }));
        expect(sendMail.mock.calls[0][0].html).toContain('A&amp;B');
    });
});
