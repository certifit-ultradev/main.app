import { z } from 'zod';

export const EmailDataSchema = z.object({
    nombre: z.string().min(1, 'El nombre es obligatorio'), empresa: z.string().min(1, 'La empresa es obligatoria'),
    email: z.string().email('El correo debe ser válido'), telefono: z.string().min(1, 'El teléfono es obligatorio'),
    curso: z.string().min(1, 'Selecciona un curso'), detalles: z.string().min(1, 'Los detalles son obligatorios'),
    terminos: z.boolean().refine((value) => value === true, 'Debes aceptar los Términos y Condiciones'),
});

export type EmailDataFormValues = z.infer<typeof EmailDataSchema>;
