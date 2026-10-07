/** Browser-only state for the multi-step registration form. It is not an API DTO. */
export type RegistrationIdentificationType = 'CC' | 'TI' | 'CE' | 'NIT' | 'PAS';

export interface RegistrationProfileFormValues {
    name: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    checkTerms: boolean;
    identification: string;
    identificationType: RegistrationIdentificationType;
}

export interface RegistrationFormValues extends RegistrationProfileFormValues {
    password: string;
    confirmPassword: string;
}
