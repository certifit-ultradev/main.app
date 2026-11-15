/** Persistence-neutral records used by identity token and OTP adapters. */
export type VerificationTokenRecord = {
    id: string;
    email: string;
    token: string;
    expires: Date;
};

export type NewVerificationToken = Omit<VerificationTokenRecord, 'id'>;

export type PasswordResetTokenRecord = {
    id: string;
    email: string;
    token: string;
    expires: Date;
};

export type NewPasswordResetToken = Omit<PasswordResetTokenRecord, 'id'>;

export type OtpVerificationRecord = {
    id: string;
    sid: string;
    value: string;
    attempts: number;
    type: string;
    status: string;
};

export type NewOtpVerification = Omit<OtpVerificationRecord, 'id'>;
