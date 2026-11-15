export type IssuedPasswordResetToken = {
    email: string;
    token: string;
    expires: Date;
};

export type PasswordResetConsumption =
    | { status: 'success' }
    | { status: 'invalid_token' }
    | { status: 'expired_token' }
    | { status: 'user_missing' };

export interface PasswordResetAccountReader {
    findByEmail(email: string): Promise<{ email: string } | null>;
}

export interface PasswordResetTokenIssuer {
    issueForEmail(email: string): Promise<IssuedPasswordResetToken>;
}

export interface PasswordResetNotificationPort {
    sendPasswordResetLink(input: { email: string; token: string }): Promise<void>;
}

export interface PasswordResetCredentialStore {
    consumeTokenAndSetPassword(input: { token: string; passwordHash: string }): Promise<PasswordResetConsumption>;
}
