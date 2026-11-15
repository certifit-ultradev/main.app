import { z } from 'zod';
import { isValidCombinedPhoneNumber } from '@/shared/phone-number';

export const ClientProfileSchema = z.object({
    id: z.string(),
    name: z.string(),
    lastName: z.string(),
    email: z.string(),
    phoneNumber: z.string(),
    profileImage: z.string().url().nullable(),
    identification: z.string().nullable(),
    identificationType: z.string().nullable(),
    createdAt: z.string().datetime(),
}).strict();

/** The self-service route accepts only these four editable fields. */
export const ClientProfileFieldsSchema = z.object({
    name: z.string().trim().min(3).max(100).optional(),
    lastName: z.string().trim().min(3).max(100).optional(),
    phoneNumber: z.string().refine(isValidCombinedPhoneNumber, 'El número de teléfono no es válido.').optional(),
    profileImage: z.string().url().nullable().optional(),
}).strict();

export const UpdateClientProfileSchema = ClientProfileFieldsSchema.refine(
    (value) => Object.keys(value).length > 0, 'No hay cambios para guardar.',
);

export type UpdateClientProfileInput = z.infer<typeof UpdateClientProfileSchema>;
