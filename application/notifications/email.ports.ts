/** Inputs are application commands; they deliberately contain no SMTP/provider details. */
export type VerificationEmailCommand = {
    email: string;
    token: string;
};

export type CourseInformationRequestEmailCommand = {
    canonicalId: string;
    nombre: string;
    empresa: string;
    email: string;
    telefono: string;
    curso: string;
    detalles: string;
    terminos: boolean;
};

export interface VerificationEmailNotificationPort {
    sendVerificationLink(input: VerificationEmailCommand): Promise<void>;
}

export interface CourseInformationRequestNotificationPort {
    sendCourseInformationRequest(input: CourseInformationRequestEmailCommand): Promise<void>;
}
