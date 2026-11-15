import { z } from 'zod';
import { isValidCombinedPhoneNumber } from '@/shared/phone-number';

const identificationType = z.enum(['CC', 'TI', 'CE', 'NIT', 'PAS']);
const password = z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').regex(/[A-Z]/, 'La contraseña debe tener al menos una letra mayúscula').regex(/\d/, 'La contraseña debe tener al menos un número');

export const CreateUserSchema = z.object({
    name: z.string().min(3, { message: 'Los nombres son requeridos' }),
    lastName: z.string().min(3, { message: 'Los apellidos son requeridos' }),
    email: z.string().email({ message: 'El correo es requerido' }),
    phoneNumber: z.string({ required_error: 'El número de teléfono es requerido' }).refine(isValidCombinedPhoneNumber, 'El número de teléfono es inválido'),
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
}).superRefine((data, context) => {
    if (data.phoneNumber && !isValidCombinedPhoneNumber(data.phoneNumber)) {
        context.addIssue({ code: 'custom', path: ['phoneNumber'], message: 'El número de teléfono es inválido' });
    }
    if (data.password && (data.password.length < 8 || !/[A-Z]/.test(data.password)
        || !/\d/.test(data.password) || data.password !== data.confirmPassword)) {
        context.addIssue({ code: 'custom', path: ['confirmPassword'], message: 'La contraseña no cumple los requisitos o no coincide' });
    }
});
