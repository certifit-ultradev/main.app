import nodemailer from 'nodemailer';

export const createTransporter = async () => {
    return nodemailer.createTransport({
        host: 'smtp.mailersend.net',
        port: 587,
        secure: false,
        auth: {
            user: process.env.MAILERSEND_SMTP_USER,
            pass: process.env.MAILERSEND_SMTP_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });;
};