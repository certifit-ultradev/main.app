'use client';

import { Dispatch, SetStateAction, useState } from 'react';
import { FirstStepRegisterSchema } from '@/utils/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { RegisterPageData, RegisterUserFirstStep } from '@/utils/types';
import { BasicFieldsForm } from './components/user-fields-form';
import { FormError } from '../form/form-error';
import { FormSuccess } from '../form/form-success';
import { CheckTerms } from './components/check-terms';

interface RegisterFormProps {
    data: RegisterUserFirstStep;
    setData: Dispatch<SetStateAction<RegisterPageData>>;
    nextStep: () => void;
};

export const RegistrationForm = ({ data, setData, nextStep }: RegisterFormProps) => {
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<z.infer<typeof FirstStepRegisterSchema>>({
        resolver: zodResolver(FirstStepRegisterSchema),
        defaultValues: {
            name: data.name,
            lastName: data.lastName,
            email: data.email,
            phoneNumber: data.phoneNumber,
            checkTerms: data.checkTerms,
        }
    });

    const onSubmit = (formData: z.infer<typeof FirstStepRegisterSchema>) => {
        setError('');
        setSuccess('');

        // Actualizamos los datos con el número de teléfono completo
        setData((prevDatos) => ({
            ...prevDatos,
            ...formData,
        }));

        nextStep();
    };

    return (
        <div className={cn('flex flex-col justify-center items-center bg-white p-10')}>
            <h1 className={cn('text-2xl font-semibold mb-4 text-left w-full max-w-lg')}>
                Datos Básicos
            </h1>
            <p className={cn('text-gray-500 mb-6 text-left w-full max-w-lg')}>
                Proporcione su nombre completo y dirección de correo electrónico para comenzar a crear su cuenta.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className={cn('w-full max-w-lg min-w-[20rem]')}>
                <BasicFieldsForm register={register} control={control} errors={errors} />
                <CheckTerms register={register} errors={errors} />
                <div className={cn('relative mb-4')}>
                    <FormError error={error} />
                    <FormSuccess message={success} />
                </div>

                <Button color='primary' type='submit' className={cn('w-full bg-[#0BBBE7] text-white rounded-full hover:bg-[#009fdf] transition-colors')} > Continuar</Button>
            </form>
        </div>
    )
}