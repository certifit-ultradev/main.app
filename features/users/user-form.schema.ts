import { z } from 'zod';

const identificationType = z.enum(['CC', 'TI', 'CE', 'NIT', 'PAS']);
const password = z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').regex(/[A-Z]/, 'La contraseña debe tener al menos una letra mayúscula').regex(/\d/, 'La contraseña debe tener al menos un número');

export const CreateUserSchema = z.object({
    name: z.string().min(3, { message: 'Los nombres son requeridos' }),
    lastName: z.string().min(3, { message: 'Los apellidos son requeridos' }),
    email: z.string().email({ message: 'El correo es requerido' }),
    phoneNumber: z.string({ required_error: 'El número de teléfono es requerido' }).min(12, 'es obligatorio el indicador y el número de teléfono').regex(/^\d{7,15}$/, 'El número de teléfono es inválido'),
    password,
    confirmPassword: z.string(),
    identification: z.string().optional(),
    identificationType: identificationType.optional(),
}).refine((data) => data.password === data.confirmPassword, { message: 'Las contraseñas no coinciden', path: ['confirmPassword'] });

export const EditUserSchema = z.object({
    name: z.string().optional(), lastName: z.string().optional(),
    email: z.string().email({ message: 'Correo electrónico inválido' }).optional(),
    phoneNumber: z.string().optional(), password: z.string().optional(), confirmPassword: z.string().optional(),
    identification: z.string().optional(), identificationType: identificationType.optional(),
}).refine((data) => {
    if (data.phoneNumber && (data.phoneNumber.length < 12 || !/^\d{7,15}$/.test(data.phoneNumber))) return false;
    if (data.password && (data.password.length < 8 || !/[A-Z]/.test(data.password) || !/\d/.test(data.password) || data.password !== data.confirmPassword)) return false;
    return true;
}, { message: 'La contraseña o el número de teléfono no cumplen los requisitos, o las contraseñas no coinciden', path: ['confirmPassword'] });
