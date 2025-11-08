import { createTransporter } from "@/lib/nodemailer";
import {
    sendPasswordResetEmail,
    sendVerificationEmail,
    dispatchEmailRequestCourse
} from '@/repository/nodemailer';
import { RequestCourseData } from "@/utils/types";

jest.mock('@/lib/nodemailer', () => ({
    createTransporter: jest.fn()
}));

describe('Nodemailer Repository Tests', () => {
    const mockSendMail = jest.fn();
    const mockTransporter = {
        sendMail: mockSendMail
    };

    beforeEach(() => {
        (createTransporter as jest.Mock).mockResolvedValue(mockTransporter);
        process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
        process.env.FROM_EMAIL = 'test@certifit.com';
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('sendPasswordResetEmail', () => {
        test('debería enviar un correo de restablecimiento de contraseña con el token correcto', async () => {
            const email = 'usuario@test.com';
            const token = 'reset-token-123';
            const expectedResetLink = `http://localhost:3000/new-password?token=${token}`;

            mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

            await sendPasswordResetEmail(email, token);

            expect(createTransporter).toHaveBeenCalledTimes(1);
            expect(mockSendMail).toHaveBeenCalledTimes(1);
            expect(mockSendMail).toHaveBeenCalledWith({
                from: 'test@certifit.com',
                to: email,
                subject: 'Restablece tu contraseña',
                html: expect.stringContaining(expectedResetLink)
            });
            expect(mockSendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: expect.stringContaining('Restablecer contraseña')
                })
            );
        });

        test('debería incluir el contenido HTML esperado en el correo', async () => {
            const email = 'usuario@test.com';
            const token = 'reset-token-123';

            mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

            await sendPasswordResetEmail(email, token);

            const callArgs = mockSendMail.mock.calls[0][0];
            expect(callArgs.html).toContain('Has solicitado restablecer tu contraseña');
            expect(callArgs.html).toContain('El equipo de Certifit');
        });

        test('debería manejar errores al enviar el correo', async () => {
            const email = 'usuario@test.com';
            const token = 'reset-token-123';
            const error = new Error('Error al enviar correo');

            mockSendMail.mockRejectedValue(error);

            await expect(sendPasswordResetEmail(email, token)).rejects.toThrow('Error al enviar correo');
            expect(mockSendMail).toHaveBeenCalledTimes(1);
        });
    });

    describe('sendVerificationEmail', () => {
        test('debería enviar un correo de verificación con el token correcto', async () => {
            const email = 'usuario@test.com';
            const token = 'verify-token-456';
            const expectedConfirmLink = `http://localhost:3000/verify-email?token=${token}`;

            mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

            await sendVerificationEmail(email, token);

            expect(createTransporter).toHaveBeenCalledTimes(1);
            expect(mockSendMail).toHaveBeenCalledTimes(1);
            expect(mockSendMail).toHaveBeenCalledWith({
                from: 'test@certifit.com',
                to: email,
                subject: 'Confirma tu correo electrónico',
                html: expect.stringContaining(expectedConfirmLink)
            });
        });

        test('debería incluir el contenido HTML esperado en el correo de verificación', async () => {
            const email = 'usuario@test.com';
            const token = 'verify-token-456';

            mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

            await sendVerificationEmail(email, token);

            const callArgs = mockSendMail.mock.calls[0][0];
            expect(callArgs.html).toContain('Gracias por registrarte en Certifit');
            expect(callArgs.html).toContain('Confirmar correo electrónico');
            expect(callArgs.html).toContain('El equipo de Certifit');
        });

        test('debería manejar errores al enviar el correo de verificación', async () => {
            const email = 'usuario@test.com';
            const token = 'verify-token-456';
            const error = new Error('Error de red');

            mockSendMail.mockRejectedValue(error);

            await expect(sendVerificationEmail(email, token)).rejects.toThrow('Error de red');
            expect(mockSendMail).toHaveBeenCalledTimes(1);
        });
    });

    describe('dispatchEmailRequestCourse', () => {
        test('debería enviar un correo con la información del curso solicitado', async () => {
            const requestData: RequestCourseData = {
                canonicalId: 'curso-001',
                nombre: 'Juan Pérez',
                empresa: 'Tech Corp',
                email: 'juan@techcorp.com',
                telefono: '+57 300 1234567',
                curso: 'Desarrollo Web Avanzado',
                detalles: 'Necesito información sobre horarios',
                terminos: true
            };

            mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

            await dispatchEmailRequestCourse(requestData);

            expect(createTransporter).toHaveBeenCalledTimes(1);
            expect(mockSendMail).toHaveBeenCalledTimes(1);
            expect(mockSendMail).toHaveBeenCalledWith({
                from: 'test@certifit.com',
                to: 'certifit.ultra@gmail.com',
                subject: 'Información sobre el curso',
                html: expect.any(String)
            });
        });

        test('debería incluir todos los datos del solicitante en el HTML', async () => {
            const requestData: RequestCourseData = {
                canonicalId: 'curso-002',
                nombre: 'María García',
                empresa: 'Innovation Labs',
                email: 'maria@innovationlabs.com',
                telefono: '+57 310 9876543',
                curso: 'Machine Learning Básico',
                detalles: 'Interesada en curso para 5 personas',
                terminos: true
            };

            mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

            await dispatchEmailRequestCourse(requestData);

            const callArgs = mockSendMail.mock.calls[0][0];
            expect(callArgs.html).toContain(requestData.nombre);
            expect(callArgs.html).toContain(requestData.empresa);
            expect(callArgs.html).toContain(requestData.email);
            expect(callArgs.html).toContain(requestData.telefono);
            expect(callArgs.html).toContain(requestData.curso);
            expect(callArgs.html).toContain(requestData.detalles);
            expect(callArgs.html).toContain('Sí'); // terminos: true
        });

        test('debería mostrar "No" cuando terminos es false', async () => {
            const requestData: RequestCourseData = {
                canonicalId: 'curso-003',
                nombre: 'Pedro López',
                empresa: 'StartUp XYZ',
                email: 'pedro@startupxyz.com',
                telefono: '+57 320 5555555',
                curso: 'Python Avanzado',
                detalles: 'Consulta de precios',
                terminos: false
            };

            mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

            await dispatchEmailRequestCourse(requestData);

            const callArgs = mockSendMail.mock.calls[0][0];
            expect(callArgs.html).toContain('No'); // terminos: false
        });

        test('debería manejar errores al enviar el correo de solicitud de curso', async () => {
            const requestData: RequestCourseData = {
                canonicalId: 'curso-004',
                nombre: 'Test User',
                empresa: 'Test Company',
                email: 'test@test.com',
                telefono: '+57 300 0000000',
                curso: 'Test Course',
                detalles: 'Test details',
                terminos: true
            };

            const error = new Error('Error de conexión SMTP');
            mockSendMail.mockRejectedValue(error);

            await expect(dispatchEmailRequestCourse(requestData)).rejects.toThrow('Error de conexión SMTP');
            expect(mockSendMail).toHaveBeenCalledTimes(1);
        });

        test('debería incluir el formato HTML correcto con estilos', async () => {
            const requestData: RequestCourseData = {
                canonicalId: 'curso-005',
                nombre: 'Test User',
                empresa: 'Test Company',
                email: 'test@test.com',
                telefono: '+57 300 0000000',
                curso: 'Test Course',
                detalles: 'Test details',
                terminos: true
            };

            mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

            await dispatchEmailRequestCourse(requestData);

            const callArgs = mockSendMail.mock.calls[0][0];
            expect(callArgs.html).toContain('<!DOCTYPE html>');
            expect(callArgs.html).toContain('Solicitud de Información de Curso');
            expect(callArgs.html).toContain('© 2024 Certifit');
        });
    });
});
