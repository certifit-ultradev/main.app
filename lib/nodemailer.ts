import nodemailer from 'nodemailer';

export const createTransporter = async () => {
    return nodemailer.createTransport({
        host: 'smtp.mailersend.net',
        port: 587,
        secure: false, // TLS se activa con requireTLS. `secure: true` es para el puerto 465.
        auth: {
            user: process.env.MAILERSEND_SMTP_USER, // Tu usuario de MailerSend
            pass: process.env.MAILERSEND_SMTP_PASSWORD, // Tu contraseña de MailerSend
        },
        tls: {
            // No fallar en certificados inválidos (útil para entornos de prueba)
            rejectUnauthorized: false,
        },
    });;
};