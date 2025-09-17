// services/emailService.ts

import { createTransporter } from "@/lib/nodemailer";
import { RequestCourseData } from "@/utils/types";

const domain = process.env.NEXT_PUBLIC_APP_URL;

/**
 * 
 * @param email 
 * @param token 
 */
export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/new-password?token=${token}`;
  console.log("confirmLink", resetLink);
  const transporter = await createTransporter();

  const data = {
    from: process.env.FROM_EMAIL as string,
    to: email,
    subject: 'Restablece tu contraseña',
    html: `
        <p>Hola,</p>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
        <p><a href="${resetLink}">Restablecer contraseña</a></p>
        <p>Si no solicitaste este cambio, ignora este correo.</p>
        <p>Saludos,<br/>El equipo de Certifit</p>
      `,
  }

  await transporter.sendMail(data);
};

/**
 * 
 * @param email 
 * @param token 
 */
export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/verify-email?token=${token}`;
  console.log("confirmLink", confirmLink);
  const transporter = await createTransporter();

  const data = {
    from: process.env.FROM_EMAIL as string,
    to: email,
    subject: 'Confirma tu correo electrónico',
    html: `
        <p>Hola,</p>
        <p>Gracias por registrarte en Certifit. Por favor, confirma tu correo electrónico haciendo clic en el siguiente enlace:</p>
        <p><a href="${confirmLink}">Confirmar correo electrónico</a></p>
        <p>Si no creaste una cuenta, ignora este correo.</p>
        <p>Saludos,<br/>El equipo de Certifit</p>
      `,
  }

  await transporter.sendMail(data);
};

/**
 * 
 * @param email 
 * @param token 
 */
export const dispatchEmailRequestCourse = async (data: RequestCourseData) => {
  const transporter = await createTransporter();
  await transporter.sendMail({
    from: process.env.FROM_EMAIL as string,
    to: "certifit.ultra@gmail.com",
    subject: 'Información sobre el curso',
    html: `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Solicitud de Información de Curso</title>
    <style>
      /* Estilos en línea para mayor compatibilidad en correos */
      body {
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
        font-family: Arial, sans-serif;
        color: #333;
      }
      .container {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        padding: 20px;
      }
      h1 {
        color: #0bbbe7;
        font-size: 24px;
        margin-bottom: 20px;
      }
      .field {
        margin-bottom: 15px;
      }
      .field-label {
        font-weight: bold;
        margin-bottom: 5px;
        font-size: 14px;
      }
      .field-value {
        font-size: 14px;
      }
      .footer {
        margin-top: 20px;
        font-size: 12px;
        text-align: center;
        color: #777;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Solicitud de Información de Curso</h1>
      <p>Se ha recibido la siguiente solicitud de información:</p>
      <div class="field">
        <div class="field-label">Nombre:</div>
        <div class="field-value">${data.nombre}</div>
      </div>
      <div class="field">
        <div class="field-label">Empresa:</div>
        <div class="field-value">${data.empresa}</div>
      </div>
      <div class="field">
        <div class="field-label">Correo electrónico:</div>
        <div class="field-value">${data.email}</div>
      </div>
      <div class="field">
        <div class="field-label">Teléfono:</div>
        <div class="field-value">${data.telefono}</div>
      </div>
      <div class="field">
        <div class="field-label">Curso de interés:</div>
        <div class="field-value">${data.curso}</div>
      </div>
      <div class="field">
        <div class="field-label">Detalles adicionales:</div>
        <div class="field-value">${data.detalles}</div>
      </div>
      <div class="field">
        <div class="field-label">Aceptó Términos y Condiciones:</div>
        <div class="field-value">${data.terminos ? "Sí" : "No"}</div>
      </div>
      <div class="footer">
        © 2024 Certifit
      </div>
    </div>
  </body>
</html>`,
  });
}