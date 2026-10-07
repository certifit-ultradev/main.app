import type {
    CourseInformationRequestEmailCommand,
    CourseInformationRequestNotificationPort,
    VerificationEmailCommand,
    VerificationEmailNotificationPort,
} from '@/application/notifications/email.ports';
import type { PasswordResetNotificationPort } from '@/application/identity/password-reset.ports';
import { getPublicAppUrl, getServerEnv } from '@/config/env';
import { createNodemailerTransporter } from './nodemailer-transporter';

const escapeHtml = (value: string): string => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const sendMail = async (message: { to: string; subject: string; html: string }): Promise<void> => {
    const transporter = await createNodemailerTransporter();
    await transporter.sendMail({ from: getServerEnv().FROM_EMAIL, ...message });
};

const sendVerificationLink = async ({ email, token }: VerificationEmailCommand): Promise<void> => {
    const confirmLink = `${getPublicAppUrl()}/verify-email?token=${encodeURIComponent(token)}`;
    await sendMail({
        to: email,
        subject: 'Confirma tu correo electrónico',
        html: `<p>Hola,</p><p>Gracias por registrarte en Certifit. Confirma tu correo:</p><p><a href="${confirmLink}">Confirmar correo electrónico</a></p><p>Si no creaste una cuenta, ignora este correo.</p>`,
    });
};

const sendPasswordResetLink: PasswordResetNotificationPort['sendPasswordResetLink'] = async ({ email, token }) => {
    const resetLink = `${getPublicAppUrl()}/new-password?token=${encodeURIComponent(token)}`;
    await sendMail({
        to: email,
        subject: 'Restablece tu contraseña',
        html: `<p>Hola,</p><p>Has solicitado restablecer tu contraseña.</p><p><a href="${resetLink}">Restablecer contraseña</a></p><p>Si no solicitaste este cambio, ignora este correo.</p>`,
    });
};

const sendCourseInformationRequest = async (input: CourseInformationRequestEmailCommand): Promise<void> => {
    const fields: Array<[string, string]> = [
        ['Curso', input.canonicalId],
        ['Nombre', input.nombre],
        ['Empresa', input.empresa],
        ['Correo electrónico', input.email],
        ['Teléfono', input.telefono],
        ['Curso de interés', input.curso],
        ['Detalles', input.detalles],
        ['Aceptó términos', input.terminos ? 'Sí' : 'No'],
    ];
    const html = `<h1>Solicitud de información de curso</h1>${fields
        .map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`)
        .join('')}`;
    await sendMail({ to: 'certifit.ultra@gmail.com', subject: 'Información sobre el curso', html });
};

/** The only adapter that knows Nodemailer/SMTP for application notifications. */
export const nodemailerEmailGateway: PasswordResetNotificationPort
    & VerificationEmailNotificationPort
    & CourseInformationRequestNotificationPort = {
    sendPasswordResetLink,
    sendVerificationLink,
    sendCourseInformationRequest,
};
