'use client';

import { z } from 'zod';

const editorCategorySchema = z.object({
    id: z.number({ message: 'La categoría es obligatoria' }).min(1, 'La categoría es obligatoria'),
    name: z.string().optional(),
});

const editorAssetSchema = z.union([
    z.instanceof(File, { message: 'Debes subir un archivo' }),
    z.string().url('La URL del archivo no es válida'),
]);

export const CourseBasicInfoSchema = z.object({
    title: z.string().min(1, 'El título es obligatorio'),
    courseImage: editorAssetSchema,
    description: z.string().min(1, 'La descripción es obligatoria'),
    price: z.preprocess((value) => typeof value === 'string' && value.trim() !== '' ? Number(value) : value,
        z.number().positive('El precio debe ser un número positivo')),
    instructorName: z.string().min(1, 'El nombre del instructor es obligatorio'),
    instructorPhoto: editorAssetSchema,
    category: editorCategorySchema,
    expiresAt: z.preprocess(
        (value) => typeof value === 'string' ? new Date(value) : value,
        z.date().refine((date) => date > new Date(), 'La fecha de vencimiento debe ser mayor a la fecha actual'),
    ),
});

const editorQuestionBaseSchema = z.object({
    id: z.number().int().positive().optional(),
    clientKey: z.string().optional(),
    title: z.string().min(1, 'El título de la pregunta es obligatorio'),
    points: z.number().min(1, 'El valor de la pregunta debe ser mayor a 0'),
});

const multipleChoiceQuestionSchema = editorQuestionBaseSchema.extend({
    type: z.literal('multiple'),
    expectedAnswer: z.never().optional(),
    options: z.array(z.object({
        id: z.number().int().positive().optional(),
        clientKey: z.string().optional(),
        value: z.string().min(1, 'El valor de la opción es obligatorio'),
        isCorrect: z.boolean(),
    }).strict()).min(2, 'Las preguntas de tipo "multiple" deben tener al menos dos opciones')
        .superRefine((options, context) => {
            if (options.filter((option) => option.isCorrect).length !== 1) {
                context.addIssue({ code: z.ZodIssueCode.custom, message: 'Debe haber exactamente una opción correcta' });
            }
        }),
}).strict();

const textQuestionSchema = editorQuestionBaseSchema.extend({
    type: z.literal('text'),
    options: z.never().optional(),
    expectedAnswer: z.object({
        value: z.string().trim().min(1, 'La respuesta esperada es obligatoria'),
    }).strict(),
}).strict();

/** Browser-only validation because editor assets may be `File` instances. */
export const CourseModulesSchema = z.array(z.object({
    title: z.string().min(3, 'El nombre del módulo es obligatorio'),
    minRequiredPoints: z.number().min(1, 'Debe ser un número mayor a cero'),
    classes: z.array(z.object({
        title: z.string().min(1, 'El nombre de la clase es obligatorio'),
        description: z.string().min(1, 'La descripción de la clase es obligatoria'),
        video: editorAssetSchema,
    })).min(1, 'El módulo debe tener al menos una clase'),
    quiz: z.object({
        title: z.string().min(1, 'El nombre del quiz es obligatorio'),
        description: z.string().min(1, 'La descripción del quiz es obligatoria'),
        questions: z.array(z.discriminatedUnion('type', [multipleChoiceQuestionSchema, textQuestionSchema]))
            .min(1, 'El quiz debe tener al menos una pregunta'),
    }),
}));
