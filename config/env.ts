import { z } from 'zod';

/**
 * Schema de validación para variables de entorno
 * Centraliza y valida todas las variables de entorno del proyecto
 */
const envSchema = z.object({
    // App
    APP_ENV: z.enum(['DEV', 'PROD']).default('DEV'),
    NEXT_PUBLIC_DOMAIN: z.string().url().optional(),

    // Wompi Payment Gateway
    WOMPI_PUB_KEY: z.string().min(1, 'WOMPI_PUB_KEY is required'),
    WOMPI_SIG_DATA: z.string().min(1, 'WOMPI_SIG_DATA is required'),
    WOMPI_EVENT_KEY: z.string().optional(),

    // Database
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

    // Auth
    AUTH_SECRET: z.string().min(1, 'AUTH_SECRET is required'),
});

/**
 * Configuración de URLs de APIs externas
 */
export const apiUrls = {
    wompi: {
        sandbox: 'https://sandbox.wompi.co/v1',
        production: 'https://production.wompi.co/v1',
    },
} as const;

/**
 * Obtiene la URL base de Wompi según el entorno
 */
export const getWompiBaseUrl = (): string => {
    const isProd = process.env.APP_ENV === 'PROD';
    return isProd ? apiUrls.wompi.production : apiUrls.wompi.sandbox;
};

/**
 * Tipo inferido del schema de entorno
 */
export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Valida las variables de entorno en tiempo de ejecución
 * Lanza error si hay variables faltantes o inválidas
 */
export const validateEnv = (): EnvConfig => {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        console.error('❌ Invalid environment variables:');
        console.error(result.error.flatten().fieldErrors);
        throw new Error('Invalid environment variables');
    }

    return result.data;
};

/**
 * Acceso seguro a variables de entorno (lazy validation)
 */
let cachedEnv: EnvConfig | null = null;

export const getEnv = (): EnvConfig => {
    if (!cachedEnv) {
        cachedEnv = validateEnv();
    }
    return cachedEnv;
};
