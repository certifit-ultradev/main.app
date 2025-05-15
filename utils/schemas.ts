import { z } from "zod";

export const LoginSchema = z.object({
    email: z.string().email({
        message: "El correo es requerido",
    }),
    password: z.string().min(1, {
        message: "La contraseña es requerida",
    })
});

export const FirstStepRegisterSchema = z.object({
    name: z.string().min(3, {
        message: 'Los nombres son requeridos',
    }),
    lastName: z.string().min(3, {
        message: 'Los apellidos son requeridos',
    }),
    email: z.string().email({
        message: 'El correo es requerido',
    }),
    phoneNumber: z.string({
        required_error: 'El número de teléfono es requerido',
    }).min(12, "es obligatorio el indicador y el número de teléfono").refine((val) => {
        // Valida que el número de teléfono contenga solo dígitos
        return /^\d{7,15}$/.test(val);
    }, {
        message: 'El número de teléfono es inválido',
    }),
    checkTerms: z.boolean().refine((val) => val === true, {
        message: 'Debe aceptar los términos y condiciones',
    }),
});

export const ResetSchema = z.object({
    email: z.string().email({
        message: "El correo es requerido",
    }),
});

export const NewPasswordSchema = z.object({
    password: z
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .regex(/[A-Z]/, 'La contraseña debe tener al menos una letra mayúscula')
        .regex(/\d/, 'La contraseña debe tener al menos un número'),
    confirmPassword: z.string(),
})
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
    });

export const ThirdStepRegisterSchema = z.object({
    verificationCode: z.string()
        .length(6, 'El código debe tener 6 dígitos')
        .regex(/^\d+$/, 'El código debe contener solo números'),
});

export const SecondStepRegisterSchema = z.object({
    password: z
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .regex(/[A-Z]/, 'La contraseña debe tener al menos una letra mayúscula')
        .regex(/\d/, 'La contraseña debe tener al menos un número'),
    confirmPassword: z.string(),
})
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
    });

const CourseCategorySchema = z.object({
    id: z.number({ message: 'La categoría es obligatoria' }).min(1, 'La categoría es obligatoria'),
    name: z.string().optional(),
});

export const CreateUserSchema = z.object({
    name: z.string().min(3, {
        message: 'Los nombres son requeridos',
    }),
    lastName: z.string().min(3, {
        message: 'Los apellidos son requeridos',
    }),
    email: z.string().email({
        message: 'El correo es requerido',
    }),
    phoneNumber: z.string({
        required_error: 'El número de teléfono es requerido',
    }).min(12, "es obligatorio el indicador y el número de teléfono").refine((val) => {
        // Valida que el número de teléfono contenga solo dígitos
        return /^\d{7,15}$/.test(val);
    }, {
        message: 'El número de teléfono es inválido',
    }),
    password: z
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .regex(/[A-Z]/, 'La contraseña debe tener al menos una letra mayúscula')
        .regex(/\d/, 'La contraseña debe tener al menos un número'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
});

export const EditUserSchema = z.object({
    name: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email({ message: 'Correo electrónico inválido' }).optional(),
    phoneNumber: z.string().optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
}).refine((data) => {
    // Validación condicional del número de teléfono
    if (data.phoneNumber && data.phoneNumber.length > 0) {
        // Debe tener mínimo 12 caracteres (indicativo + número)
        if (data.phoneNumber.length < 12) return false;
        // Debe contener solo dígitos y de 7 a 15 dígitos
        if (!/^\d{7,15}$/.test(data.phoneNumber)) return false;
    }

    // Validación condicional de la contraseña
    if (data.password && data.password.length > 0) {
        if (data.password.length < 8) return false; // mínimo 8 caracteres
        if (!/[A-Z]/.test(data.password)) return false; // al menos una mayúscula
        if (!/\d/.test(data.password)) return false;    // al menos un número
        if (data.password !== data.confirmPassword) return false; // debe coincidir con confirmPassword
    }

    return true;
}, {
    message: 'La contraseña o el número de teléfono no cumplen los requisitos, o las contraseñas no coinciden',
    path: ['confirmPassword'], // se puede ajustar la ruta del error si se desea
});

export const CreateCategorySchema = z.object({
    name: z.string().min(3, {
        message: 'El nombre es requerido',
    }),
});

export const EditCategorySchema = z.object({
    name: z.string().optional(),
});

export const CourseBasicInfoSchema = z.object({
    title: z.string().min(1, 'El título es obligatorio'),
    courseImage: z.union([
        z.instanceof(File, { message: "Debes subir una imagen" }).optional(), // Permitir que sea un archivo o undefined
        z.string().url("La url de la imagen no es válida").optional(), // Permitir URL si ya está cargado
    ]).refine((value) => {
        return value !== undefined
    }, 'La imagen es obligatoria'),
    description: z.string().min(1, 'La descripción es obligatoria'),
    price: z.preprocess((value) => parseFloat(value as string), z.number().positive('El precio debe ser un número positivo')), // Updated to parse input value to number
    instructorName: z.string().min(1, 'El nombre del instructor es obligatorio'),
    instructorPhoto: z.union([
        z.instanceof(File, { message: "Debes subir una imagen" }).optional(), // Permitir que sea un archivo o undefined
        z.string().url("La url de la imagen no es válida").optional(), // Permitir URL si ya está cargado
    ]).refine((value) => {
        return value !== undefined
    }, 'La imagen es obligatoria'),
    category: CourseCategorySchema, // La categoría ahora es un objeto
    expiresAt: z.preprocess((value) => new Date(value as string), z.date().refine((date) => date > new Date(), 'La fecha de vencimiento debe ser mayor a la fecha actual')), // Updated to parse input value to Date and validate
})

export const CourseModulesSchema = z.array(
    z.object({
        title: z.string().min(3, 'El nombre del módulo es obligatorio'),
        minRequiredPoints: z.number().min(1, 'Debe ser un número mayor a cero'),
        classes: z.array(
            z.object({
                title: z.string().min(1, 'El nombre de la clase es obligatorio'),
                description: z.string().min(1, 'La descripción de la clase es obligatoria'),
                video: z.union([
                    z.instanceof(File).optional(), // Permitir que sea un archivo o undefined
                    z.string().url("La url del vídeo no es válida").optional(), // Permitir URL si ya está cargado
                ]).refine((value) => {
                    return value !== undefined
                }, 'El video de la clase es obligatorio'),
            })
        ).min(1, 'El módulo debe tener al menos una clase'),
        quiz: z.object({
            title: z.string().min(1, 'El nombre del quiz es obligatorio'),
            description: z.string().min(1, 'La descripción del quiz es obligatoria'),
            questions: z.array(
                z.object({
                    type: z.enum(['multiple', 'text']),
                    title: z.string().min(1, 'El título de la pregunta es obligatorio'),
                    points: z.number({ message: "Debe ser un número" }).min(1, 'El valor de la pregunta debe ser un número positivo'),
                    options: z.array(
                        z.object({
                            value: z.string().min(1, 'El texto de la opción es obligatorio'),
                            isCorrect: z.boolean(),
                        })
                    )/*.refine((options, ctx) => {
              if (ctx.parent.type === 'multiple') {
                const correctOptions = options.filter((option) => option.correct);
                return options.length >= 2 && correctOptions.length === 1;
              } else if (ctx.parent.type === 'text') {
                return options.length === 1;
              }
              return true;
            }, 'Las preguntas de selección múltiple deben tener al menos dos opciones y una opción correcta. Las preguntas de texto deben tener una opción.'),
          */})
            ).min(1, 'El quiz debe tener al menos una pregunta'),
        }),
    })
);


// canonicalId, classId, isCompleted, currentTime

export const CreateClassCurrentStateSchema = z.object({
    canonicalId: z.string(),
    classId: z.number(),
    isCompleted: z.boolean(),
    currentTime: z.number()
});

export const CreateAnswerQuestionSchema = z.object({
    canonicalId: z.string(),
    moduleId: z.number(),
    questionId: z.number(),
    quizId: z.number(),
    optionId: z.number(),
    answer: z.string().optional(),
});

export const CalculateQuizScore = z.object({
    canonicalId: z.string(),
    moduleId: z.number(),
    quizId: z.number(),
});

export const CreateModuleFinishState = z.object({
    canonicalId: z.string(),
    moduleId: z.number()
}); 