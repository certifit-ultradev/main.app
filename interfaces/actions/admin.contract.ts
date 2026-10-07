import { z } from 'zod';

const userIdSchema = z.string().trim().min(1, 'El identificador de usuario es obligatorio.');
const courseIdSchema = z.number().int().positive('El identificador de curso no es válido.');
const optionalEntityId = z.number().int().positive().optional();
const identificationTypeSchema = z.enum(['CC', 'TI', 'CE', 'NIT', 'PAS']);
const passwordSchema = z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .regex(/[A-Z]/, 'La contraseña debe tener al menos una letra mayúscula.')
    .regex(/\d/, 'La contraseña debe tener al menos un número.');

// Only identification may be cleared with an empty form value. The action
// turns it into null; other required strings reject empty values.
const optionalIdentificationSchema = z.string().trim().nullable().optional()
    .transform((value) => value === '' ? null : value);

const userFieldsSchema = z.object({
    name: z.string().trim().min(3, 'Los nombres son requeridos.'),
    lastName: z.string().trim().min(3, 'Los apellidos son requeridos.'),
    email: z.string().trim().email('El correo no es válido.'),
    phoneNumber: z.string().regex(/^\d{7,15}$/, 'El número de teléfono no es válido.'),
    identification: optionalIdentificationSchema,
    identificationType: identificationTypeSchema.nullable().optional(),
});

export const CreateAdminUserInputSchema = userFieldsSchema.extend({
    password: passwordSchema,
    confirmPassword: z.string(),
}).strict().superRefine(({ password, confirmPassword }, context) => {
    if (password !== confirmPassword) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ['confirmPassword'], message: 'Las contraseñas no coinciden.' });
    }
});

export const UpdateAdminUserInputSchema = userFieldsSchema.extend({
    id: userIdSchema,
    password: passwordSchema.optional(),
    confirmPassword: z.string().optional(),
}).strict().superRefine(({ password, confirmPassword }, context) => {
    if ((password === undefined) !== (confirmPassword === undefined)) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ['confirmPassword'], message: 'Debes confirmar la contraseña.' });
    }
    if (password !== undefined && password !== confirmPassword) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ['confirmPassword'], message: 'Las contraseñas no coinciden.' });
    }
});

export const UserIdInputSchema = z.object({ id: userIdSchema }).strict();
export const AdminPageInputSchema = z.object({ page: z.number().int().min(1).max(10_000) }).strict();
export const AdminEmailInputSchema = z.object({ email: z.string().trim().email() }).strict();

const categorySchema = z.object({
    id: z.number().int().positive(),
    name: z.string().trim().min(1).optional(),
}).strict();

const optionSchema = z.object({
    id: optionalEntityId,
    quizQuestionId: optionalEntityId,
    value: z.string().trim().min(1),
    isCorrect: z.boolean(),
}).strict();

const questionBaseSchema = z.object({
    id: optionalEntityId,
    quizModuleId: optionalEntityId,
    title: z.string().trim().min(1),
    points: z.number().finite().positive(),
});

const multipleQuestionSchema = questionBaseSchema.extend({
    type: z.literal('multiple'),
    options: z.array(optionSchema).min(2).superRefine((options, context) => {
        if (options.filter((option) => option.isCorrect).length !== 1) {
            context.addIssue({ code: z.ZodIssueCode.custom, message: 'Debe existir exactamente una respuesta correcta.' });
        }
    }),
}).strict();

const textQuestionSchema = questionBaseSchema.extend({
    type: z.literal('text'),
    expectedAnswer: z.object({
        value: z.string().trim().min(1, 'La respuesta esperada es obligatoria.'),
    }).strict(),
}).strict();

const classSchema = z.object({
    id: optionalEntityId,
    courseModuleId: optionalEntityId,
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    video: z.string().url().nullable().optional(),
    videoSize: z.number().finite().nonnegative().optional(),
    videoDuration: z.number().finite().nonnegative().optional(),
}).strict();

const quizSchema = z.object({
    id: optionalEntityId,
    courseModuleId: optionalEntityId,
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    questions: z.array(z.discriminatedUnion('type', [multipleQuestionSchema, textQuestionSchema])).min(1),
}).strict();

const moduleSchema = z.object({
    id: optionalEntityId,
    courseId: optionalEntityId,
    minRequiredPoints: z.number().finite().positive(),
    title: z.string().trim().min(3),
    classes: z.array(classSchema),
    quiz: quizSchema,
}).strict();

/** Persistable course payload: files must already have been uploaded by the browser. */
export const AdminCourseInputSchema = z.object({
    id: optionalEntityId,
    title: z.string().trim().min(1),
    price: z.number().finite().positive(),
    courseImage: z.string().url(),
    instructorName: z.string().trim().min(1),
    instructorPhoto: z.string().url(),
    category: categorySchema,
    description: z.string().trim().min(1),
    expiresAt: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'La fecha de vencimiento no es válida.'),
    modules: z.array(moduleSchema).min(1),
}).strict();

export const UpdateAdminCourseInputSchema = z.object({
    courseId: courseIdSchema,
    patch: AdminCourseInputSchema,
}).strict();

export const CourseIdInputSchema = z.object({ id: courseIdSchema }).strict();
export const UpdateClassVideoInputSchema = z.object({
    clsId: courseIdSchema,
    videoPath: z.string().url(),
    videoSize: z.number().finite().nonnegative(),
}).strict();

export type CreateAdminUserInput = z.infer<typeof CreateAdminUserInputSchema>;
export type UpdateAdminUserInput = z.infer<typeof UpdateAdminUserInputSchema>;
export type AdminCourseInput = z.infer<typeof AdminCourseInputSchema>;
