import { getPublicAppUrl, getPublicEnv, getServerEnv, resetEnvCache } from '@/config/env';

describe('environment configuration', () => {
    const originalEnv = process.env;
    const validEnv = {
        APP_ENV: 'DEV',
        NEXT_PUBLIC_APP_URL: 'https://app.example.com',
        WOMPI_PUB_KEY: 'pub_key',
        WOMPI_SIG_DATA: 'signature_key',
        WOMPI_EVENT_KEY: 'event_key',
        DATABASE_URL: 'postgresql://user:password@localhost:5432/certifit',
        AUTH_SECRET: 'secret',
        FROM_EMAIL: 'noreply@example.com',
        MAILERSEND_SMTP_USER: 'smtp-user',
        MAILERSEND_SMTP_PASSWORD: 'smtp-password',
    };

    beforeEach(() => {
        process.env = { ...originalEnv, ...validEnv };
        resetEnvCache();
    });

    afterEach(() => {
        process.env = originalEnv;
        resetEnvCache();
    });

    it('returns a public contract without server secrets', () => {
        expect(getPublicEnv()).toEqual({ NEXT_PUBLIC_APP_URL: validEnv.NEXT_PUBLIC_APP_URL });
        expect(getPublicEnv()).not.toHaveProperty('AUTH_SECRET');
    });

    it('returns a validated server contract', () => {
        expect(getServerEnv().WOMPI_PUB_KEY).toBe('pub_key');
    });

    it('uses APP_URL before DOMAIN and removes its trailing slash', () => {
        process.env.NEXT_PUBLIC_APP_URL = 'https://app.example.com/';
        resetEnvCache();
        expect(getPublicAppUrl()).toBe('https://app.example.com');
    });

    it('rejects an incomplete server configuration', () => {
        delete process.env.AUTH_SECRET;
        resetEnvCache();
        expect(getServerEnv).toThrow('Invalid environment variables');
    });
});
