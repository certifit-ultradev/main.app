import { z } from 'zod';
import { safeLogger } from '@/shared/observability/safe-logger';

const publicEnvSchema = z.object({
    NEXT_PUBLIC_DOMAIN: z.string().url().optional(),
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

const serverEnvSchema = publicEnvSchema.extend({
    APP_ENV: z.enum(['DEV', 'PROD']).default('DEV'),
    WOMPI_PUB_KEY: z.string().min(1, 'WOMPI_PUB_KEY is required'),
    WOMPI_SIG_DATA: z.string().min(1, 'WOMPI_SIG_DATA is required'),
    WOMPI_EVENT_KEY: z.string().optional(),
    DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
    AUTH_SECRET: z.string().min(1, 'AUTH_SECRET is required'),
    FROM_EMAIL: z.string().email('FROM_EMAIL must be a valid email'),
    MAILERSEND_SMTP_USER: z.string().min(1, 'MAILERSEND_SMTP_USER is required'),
    MAILERSEND_SMTP_PASSWORD: z.string().min(1, 'MAILERSEND_SMTP_PASSWORD is required'),
});

export type PublicEnvConfig = z.infer<typeof publicEnvSchema>;
export type EnvConfig = z.infer<typeof serverEnvSchema>;

export const apiUrls = {
    wompi: {
        sandbox: 'https://sandbox.wompi.co/v1',
        production: 'https://production.wompi.co/v1',
    },
} as const;

let cachedServerEnv: EnvConfig | null = null;
let cachedPublicEnv: PublicEnvConfig | null = null;

/** Valida y devuelve sólo la configuración que puede exponerse al cliente. */
export const getPublicEnv = (): PublicEnvConfig => {
    if (!cachedPublicEnv) {
        const result = publicEnvSchema.safeParse(process.env);
        if (!result.success) {
            safeLogger.error('configuration.public.invalid');
            throw new Error('Invalid environment variables');
        }
        cachedPublicEnv = result.data;
    }
    return cachedPublicEnv;
};

/** Valida y devuelve la configuración exclusiva del servidor. */
export const getServerEnv = (): EnvConfig => {
    if (!cachedServerEnv) {
        const result = serverEnvSchema.safeParse(process.env);
        if (!result.success) {
            safeLogger.error('configuration.server.invalid');
            throw new Error('Invalid environment variables');
        }
        cachedServerEnv = result.data;
    }
    return cachedServerEnv;
};

/** Mantiene la API anterior para consumidores de configuración de servidor. */
export const getEnv = getServerEnv;
export const validateEnv = getServerEnv;

export const getPublicAppUrl = (): string => {
    const { NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_DOMAIN } = getPublicEnv();
    const url = NEXT_PUBLIC_APP_URL ?? NEXT_PUBLIC_DOMAIN;

    if (!url) {
        throw new Error('NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_DOMAIN is required');
    }

    return url.replace(/\/$/, '');
};

export const getWompiBaseUrl = (): string => {
    return getServerEnv().APP_ENV === 'PROD'
        ? apiUrls.wompi.production
        : apiUrls.wompi.sandbox;
};

/** Sólo para aislar módulos de prueba que modifican process.env. */
export const resetEnvCache = (): void => {
    cachedServerEnv = null;
    cachedPublicEnv = null;
};
