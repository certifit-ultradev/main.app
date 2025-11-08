import { sendEmailCourseRequestInfo } from '@/services/email';
import { dispatchEmailRequestCourse } from '@/repository/nodemailer';
import { RequestCourseData } from '@/utils/types';

jest.mock('@/repository/nodemailer');

describe('Email Service Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('sendEmailCourseRequestInfo', () => {
        test('debería enviar un correo de solicitud de información de curso', async () => {
            const requestData: RequestCourseData = {
                canonicalId: 'curso-web-dev',
                nombre: 'Juan Pérez',
                empresa: 'Tech Solutions',
                email: 'juan@techsolutions.com',
                telefono: '+57 300 1234567',
                curso: 'Desarrollo Web Avanzado',
                detalles: 'Necesito información sobre el curso y fechas disponibles',
                terminos: true
            };

            (dispatchEmailRequestCourse as jest.Mock).mockResolvedValue(undefined);

            await sendEmailCourseRequestInfo(requestData);

            expect(dispatchEmailRequestCourse).toHaveBeenCalledTimes(1);
            expect(dispatchEmailRequestCourse).toHaveBeenCalledWith(requestData);
        });

        test('debería llamar al repositorio con los datos correctos', async () => {
            const requestData: RequestCourseData = {
                canonicalId: 'curso-python',
                nombre: 'María García',
                empresa: 'Innovation Labs',
                email: 'maria@innovationlabs.com',
                telefono: '+57 310 9876543',
                curso: 'Python para Data Science',
                detalles: 'Interesada en curso corporativo para equipo de 10 personas',
                terminos: true
            };

            (dispatchEmailRequestCourse as jest.Mock).mockResolvedValue(undefined);

            await sendEmailCourseRequestInfo(requestData);

            expect(dispatchEmailRequestCourse).toHaveBeenCalledWith(
                expect.objectContaining({
                    canonicalId: 'curso-python',
                    nombre: 'María García',
                    email: 'maria@innovationlabs.com',
                    curso: 'Python para Data Science',
                })
            );
        });

        test('debería propagar errores del repositorio', async () => {
            const requestData: RequestCourseData = {
                canonicalId: 'curso-error',
                nombre: 'Test User',
                empresa: 'Test Company',
                email: 'test@test.com',
                telefono: '+57 300 0000000',
                curso: 'Test Course',
                detalles: 'Test details',
                terminos: false
            };

            const error = new Error('Error al enviar correo');
            (dispatchEmailRequestCourse as jest.Mock).mockRejectedValue(error);

            await expect(sendEmailCourseRequestInfo(requestData))
                .rejects
                .toThrow('Error al enviar correo');
            
            expect(dispatchEmailRequestCourse).toHaveBeenCalledTimes(1);
        });

        test('debería manejar diferentes tipos de datos de entrada', async () => {
            const testCases: RequestCourseData[] = [
                {
                    canonicalId: 'curso-1',
                    nombre: 'Carlos',
                    empresa: 'Empresa A',
                    email: 'carlos@empresaa.com',
                    telefono: '+57 320 1111111',
                    curso: 'Curso A',
                    detalles: 'Detalles A',
                    terminos: true
                },
                {
                    canonicalId: 'curso-2',
                    nombre: 'Ana',
                    empresa: 'Empresa B',
                    email: 'ana@empresab.com',
                    telefono: '+57 315 2222222',
                    curso: 'Curso B',
                    detalles: 'Detalles B',
                    terminos: false
                }
            ];

            (dispatchEmailRequestCourse as jest.Mock).mockResolvedValue(undefined);

            for (const requestData of testCases) {
                await sendEmailCourseRequestInfo(requestData);
                
                expect(dispatchEmailRequestCourse).toHaveBeenCalledWith(requestData);
            }

            expect(dispatchEmailRequestCourse).toHaveBeenCalledTimes(testCases.length);
        });

        test('debería funcionar con detalles vacíos', async () => {
            const requestData: RequestCourseData = {
                canonicalId: 'curso-minimal',
                nombre: 'Usuario Mínimo',
                empresa: 'Company',
                email: 'usuario@company.com',
                telefono: '+57 300 5555555',
                curso: 'Curso Básico',
                detalles: '',
                terminos: true
            };

            (dispatchEmailRequestCourse as jest.Mock).mockResolvedValue(undefined);

            await sendEmailCourseRequestInfo(requestData);

            expect(dispatchEmailRequestCourse).toHaveBeenCalledWith(
                expect.objectContaining({
                    detalles: ''
                })
            );
        });

        test('debería manejar términos aceptados y rechazados', async () => {
            const dataWithTermsAccepted: RequestCourseData = {
                canonicalId: 'curso-accepted',
                nombre: 'Usuario Acepta',
                empresa: 'Company A',
                email: 'acepta@company.com',
                telefono: '+57 300 1111111',
                curso: 'Curso Test',
                detalles: 'Acepto términos',
                terminos: true
            };

            const dataWithTermsRejected: RequestCourseData = {
                ...dataWithTermsAccepted,
                canonicalId: 'curso-rejected',
                terminos: false
            };

            (dispatchEmailRequestCourse as jest.Mock).mockResolvedValue(undefined);

            await sendEmailCourseRequestInfo(dataWithTermsAccepted);
            expect(dispatchEmailRequestCourse).toHaveBeenLastCalledWith(
                expect.objectContaining({ terminos: true })
            );

            await sendEmailCourseRequestInfo(dataWithTermsRejected);
            expect(dispatchEmailRequestCourse).toHaveBeenLastCalledWith(
                expect.objectContaining({ terminos: false })
            );
        });

        test('debería mantener todos los campos del RequestCourseData', async () => {
            const completeData: RequestCourseData = {
                canonicalId: 'curso-completo-123',
                nombre: 'Nombre Completo Test',
                empresa: 'Empresa Test S.A.S',
                email: 'completo@empresatest.com',
                telefono: '+57 301 9876543',
                curso: 'Curso Completo de Testing',
                detalles: 'Solicitud completa con todos los campos necesarios para validación',
                terminos: true
            };

            (dispatchEmailRequestCourse as jest.Mock).mockResolvedValue(undefined);

            await sendEmailCourseRequestInfo(completeData);

            expect(dispatchEmailRequestCourse).toHaveBeenCalledWith(completeData);
            
            const callArgs = (dispatchEmailRequestCourse as jest.Mock).mock.calls[0][0];
            expect(callArgs).toHaveProperty('canonicalId');
            expect(callArgs).toHaveProperty('nombre');
            expect(callArgs).toHaveProperty('empresa');
            expect(callArgs).toHaveProperty('email');
            expect(callArgs).toHaveProperty('telefono');
            expect(callArgs).toHaveProperty('curso');
            expect(callArgs).toHaveProperty('detalles');
            expect(callArgs).toHaveProperty('terminos');
        });

        test('debería ser una función async que no retorna valor', async () => {
            const requestData: RequestCourseData = {
                canonicalId: 'curso-async',
                nombre: 'Test Async',
                empresa: 'Async Company',
                email: 'async@company.com',
                telefono: '+57 300 0000000',
                curso: 'Async Course',
                detalles: 'Testing async behavior',
                terminos: true
            };

            (dispatchEmailRequestCourse as jest.Mock).mockResolvedValue(undefined);

            const result = await sendEmailCourseRequestInfo(requestData);

            expect(result).toBeUndefined();
        });
    });
});
