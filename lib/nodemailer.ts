import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // Por ejemplo, 'smtp.gmail.com'
    port: Number(process.env.EMAIL_PORT), // Por ejemplo, 587
    secure: process.env.EMAIL_SECURE === 'true', // true para 465, false para otros puertos
    auth: {
        user: process.env.EMAIL_USER, // Tu correo electrónico
        pass: process.env.EMAIL_PASS, // Tu contraseña o token de aplicación
    },
});