import { z } from 'zod';

const passwordSchema = z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .regex(/[A-Z]/, 'La contraseña debe tener al menos una letra mayúscula.')
    .regex(/\d/, 'La contraseña debe tener al menos un número.');

const identificationTypeSchema = z.enum(['CC', 'TI', 'CE', 'NIT', 'PAS']);

export const LoginInputSchema = z.object({
    email: z.string().trim().email('El correo no es válido.'),
    password: z.string().min(1, 'La contraseña es obligatoria.'),
    callbackUrl: z.string().trim().startsWith('/', 'La URL de retorno no es válida.').nullable().optional(),
}).strict();

export const RegisterAccountInputSchema = z.object({
    name: z.string().trim().min(3, 'Los nombres son requeridos.'),
    lastName: z.string().trim().min(3, 'Los apellidos son requeridos.'),
    email: z.string().trim().email('El correo no es válido.'),
    phoneNumber: z.string().regex(/^\d{7,15}$/, 'El número de teléfono no es válido.'),
    password: passwordSchema,
    confirmPassword: z.string(),
    checkTerms: z.literal(true, { errorMap: () => ({ message: 'Debes aceptar los términos y condiciones.' }) }),
    identification: z.string().trim().min(3, 'La identificación es obligatoria.'),
    identificationType: identificationTypeSchema,
}).strict().superRefine(validatePasswordConfirmation);

export const VerificationEmailInputSchema = z.object({
    email: z.string().trim().email('El correo no es válido.'),
}).strict();

export const VerificationTokenInputSchema = z.object({
    token: z.string().trim().min(1, 'El token es obligatorio.'),
}).strict();

export const PasswordResetRequestInputSchema = z.object({
    email: z.string().trim().email('El correo no es válido.'),
}).strict();

const newPasswordFieldsSchema = z.object({
    password: passwordSchema,
    confirmPassword: z.string(),
}).strict();

function validatePasswordConfirmation(
    { password, confirmPassword }: { password: string; confirmPassword: string },
    context: z.RefinementCtx,
) {
    if (password !== confirmPassword) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ['confirmPassword'], message: 'Las contraseñas no coinciden.' });
    }
}

export const NewPasswordInputSchema = newPasswordFieldsSchema.superRefine(validatePasswordConfirmation);

export const ResetPasswordWithTokenInputSchema = newPasswordFieldsSchema.extend({
    token: z.string().trim().min(1, 'El token es obligatorio.'),
}).strict().superRefine(validatePasswordConfirmation);
