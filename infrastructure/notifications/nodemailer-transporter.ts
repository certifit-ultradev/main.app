import { getServerEnv } from '@/config/env';
import nodemailer from 'nodemailer';

/** SMTP configuration is private to the Nodemailer infrastructure adapter. */
export const createNodemailerTransporter = async () => {
    const env = getServerEnv();
    return nodemailer.createTransport({
        host: 'smtp.mailersend.net',
        port: 587,
        secure: false,
        auth: {
            user: env.MAILERSEND_SMTP_USER,
            pass: env.MAILERSEND_SMTP_PASSWORD,
        },
        tls: { rejectUnauthorized: false },
    });
};
