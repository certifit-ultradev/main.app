'use client';

import { NextPage } from 'next';
import { RegistrationForm } from '@/components/auth/register-form';
import { useState } from 'react';
import { StepProgress } from '@/components/progress/step-progress';
import { PasswordConfirmationForm } from '@/components/auth/password-confirmation-form';
import { RegisterPageData } from '@/utils/types';
import { cn } from '@/lib/utils';
import { VerificationOtpEmailForm } from '@/components/auth/verification/verification-otp-email-form';

const RegisterPage: NextPage = () => {
    const [step, setStep] = useState<number>(1);
    const [data, setData] = useState<RegisterPageData>({
        name: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        checkTerms: false,
    });

    const nextStep = () => setStep(step + 1);
    const previousStep = () => setStep(step - 1);
    return (
        <div className={cn('flex flex-col mt-20 justify-center items-center bg-white p-10')}>
            <StepProgress step={step} max={3} />
            {step === 1 && (
                <RegistrationForm data={data} setData={setData} nextStep={nextStep} />
            )}
            {step === 2 && (
                <PasswordConfirmationForm data={data} setData={setData} previousStep={previousStep} nextStep={nextStep} />
            )}
            {step === 3 && (
                <VerificationOtpEmailForm data={data} />
            )}
        </div>
    );
};

export default RegisterPage;