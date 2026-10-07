import { z } from 'zod';

const passwordFields = z.object({
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').regex(/[A-Z]/, 'La contraseña debe tener al menos una letra mayúscula.').regex(/\d/, 'La contraseña debe tener al menos un número'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, { message: 'Las contraseñas no coinciden', path: ['confirmPassword'] });

export const LoginSchema = z.object({
    email: z.string().email({ message: 'El correo es requerido' }),
    password: z.string().min(1, { message: 'La contraseña es requerida' }),
});

export const FirstStepRegisterSchema = z.object({
    name: z.string().min(3, { message: 'Los nombres son requeridos' }),
    lastName: z.string().min(3, { message: 'Los apellidos son requeridos' }),
    email: z.string().email({ message: 'El correo es requerido' }),
    phoneNumber: z.string({ required_error: 'El número de teléfono es requerido' }).min(12, 'es obligatorio el indicador y el número de teléfono').regex(/^\d{7,15}$/, 'El número de teléfono es inválido'),
    checkTerms: z.boolean().refine((value) => value === true, { message: 'Debe aceptar los términos y condiciones' }),
    identification: z.string().min(3, { message: 'La identificación es obligatoria' }),
    identificationType: z.enum(['CC', 'TI', 'CE', 'NIT', 'PAS'], { message: 'El tipo de identificación es obligatorio' }),
});

export const ResetSchema = z.object({ email: z.string().email({ message: 'El correo es requerido' }) });
export const NewPasswordSchema = passwordFields;
export const SecondStepRegisterSchema = passwordFields;
