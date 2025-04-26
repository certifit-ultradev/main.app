'use client'

import { cn } from '@/lib/utils';
import { SecondStepRegisterSchema } from '@/utils/schemas';
import { ErrorMessage } from '@hookform/error-message';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dispatch, SetStateAction, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FormError } from '@/components/form/form-error';
import { FormSuccess } from '@/components/form/form-success';
import { RegisterPageData } from '@/utils/types';
import { Button } from '@/components/ui/button';
import { register as createUser } from '@/actions/auth/register';
import { CheckIcon, XIcon } from '@/components/svg/certifit-icons';

interface RegisterFormProps {
    data: RegisterPageData;
    setData: Dispatch<SetStateAction<RegisterPageData>>;
    nextStep: () => void;
    previousStep: () => void;
};

export const PasswordConfirmationForm = ({ data, setData, nextStep, previousStep }: RegisterFormProps) => {
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    // Estados para ver/ocultar contraseña
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<z.infer<typeof SecondStepRegisterSchema>>({
        resolver: zodResolver(SecondStepRegisterSchema),
        defaultValues: {
            password: data.password,
            confirmPassword: data.confirmPassword,
        }
    });

    const password = watch('password', '');
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasMinLength = password.length >= 8;

    const onSubmit = async (formData: z.infer<typeof SecondStepRegisterSchema>) => {
        setIsLoading(true);
        setError('');
        setSuccess('');
        setData((prevDatos) => ({
            ...prevDatos,
            ...formData,
        }));

        data.password = formData.password
        createUser({
            ...data
        }).then((data) => {
            setIsLoading(false);
            if (data?.success) {
                setSuccess(data.message);
                nextStep();
            } else {
                setError(data.error);
            }
        }).catch(() => setError('Algo ha pasado, intenta mas tarde!'));
    }

    return (
        <div className={cn('justify-center items-center')}>
            <div className={cn('flex flex-col justify-center items-center bg-white p-10')}>
                <form onSubmit={handleSubmit(onSubmit)} className={cn('w-full max-w-lg min-w-[20rem]')}>
                    <h1 className={cn('text-2xl font-semibold mb-4 text-left w-full max-w-lg')}>Crear Contraseña</h1>
                    <span className={cn('text-gray-500 mb-6 text-left w-full max-w-lg')}>Configure una contraseña segura para su cuenta y confirme su creación.</span>
                    <div className={cn('flex flex-wrap mb-4 relative')}>
                        <input type={isPasswordVisible ? "text" : "password"} {...register('password')} placeholder='Contraseña' className={cn('w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0BBBE7]')} />
                        <ErrorMessage
                            errors={errors}
                            name='password'
                            render={({ message }) => (
                                <p className={cn('text-red-500 text-sm text-left w-full')}>
                                    {message}
                                </p>
                            )} />
                        <button
                            type="button"
                            onClick={() => setIsPasswordVisible((prev) => !prev)}
                            className={cn(
                                "absolute right-3 top-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                            )}
                        >👁️</button>
                    </div>
                    <div className={cn(`mb-4`)}>
                        <div className={cn(`flex items-center gap-2 text-lg font-medium cursor-pointer`)}>
                            {hasUppercase ? (
                                <>
                                    <CheckIcon width={20} height={20} className={cn('text-5xl text text-[#2A8940]')} />
                                    <span className={cn('ml-3 text-[#2A8940]')}>Debe tener al menos una letra Mayúscula</span></>
                            ) : (
                                <>
                                    <XIcon width={20} height={20} className={cn('text-red-500')} />
                                    <span className={cn('ml-3 text-red-500')}>Debe tener al menos una letra Mayúscula</span>
                                </>
                            )}
                        </div>
                        <div className={cn(`flex items-center gap-2 text-lg font-medium cursor-pointer`)}>
                            {hasNumber ? (
                                <>
                                    <CheckIcon width={20} height={20} className={cn('text-5xl text text-[#2A8940]')} />
                                    <span className={cn('ml-3 text-[#2A8940]')}>Debe tener al menos un número</span>
                                </>
                            ) : (
                                <>
                                    <XIcon width={20} height={20} className={cn('text-red-500')} />
                                    <span className={cn('ml-3 text-red-500')}>Debe tener al menos un número</span>
                                </>
                            )}
                        </div>
                        <div className={cn(`flex items-center gap-2 text-lg font-medium cursor-pointer text-[#2A8940]`)}>
                            {hasMinLength ? (
                                <>
                                    <CheckIcon width={20} height={20} className={cn('text-5xl text text-[#2A8940]')} />
                                    <span className={cn('ml-3 text-[#2A8940]')}>Debe tener 8 caracteres como minimo</span>
                                </>
                            ) : (
                                <><XIcon width={20} height={20} className={cn('text-red-500')} /><span className={cn('ml-3 text-red-500')}>Debe tener 8 caracteres como minimo</span></>
                            )}
                        </div>
                    </div>
                    {/* Confirmar Contraseña */}
                    <div className={cn('flex flex-wrap mb-4')}>
                        <input type={isConfirmPasswordVisible ? "text" : "password"} {...register('confirmPassword')} placeholder='Confirmar contraseña' className={cn('w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0BBBE7]')} />
                        <ErrorMessage
                            errors={errors}
                            name='confirmPassword'
                            render={({ message }) => (
                                <p className={cn('text-red-500 text-sm text-left w-full')}>
                                    {message}
                                </p>
                            )} />
                        <button
                            type="button"
                            onClick={() => setIsConfirmPasswordVisible((prev) => !prev)}
                            className={cn(
                                "absolute right-3 top-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                            )}
                        >👁️</button>
                    </div>
                    <div className={cn('relative mb-4')}>
                        <FormError error={error} />
                        <FormSuccess message={success} />
                    </div>
                    <div className={cn('grid grid-cols-6 gap-4')}>
                        <div className={cn('col-start-1 col-end-3')}>
                            <Button
                                color='primary'
                                onClick={previousStep}
                                className={cn('w-full border border-[#0BBBE7] text-[#0BBBE7] px-6 py-2 rounded-full hover:bg-blue-50 transition-colors flex items-center gap-1')}
                            >
                                Atras
                            </Button>
                        </div>
                        <div className={cn('col-end-7 col-span-2')}>
                            <Button
                                type='submit'
                                variant='outline'
                                className={cn('w-full bg-[#0BBBE7] text-white py-2 rounded-full hover:bg-[#009fdf] transition-colors', {
                                    'opacity-50 cursor-not-allowed': isLoading
                                })}
                            >
                                {isLoading ? (
                                    <svg className={cn('animate-spin h-5 w-5 text-white')} xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                                        <circle className={cn('opacity-25')} cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                        <path className={cn('opacity-75')} fill='currentColor' d='M4 12a8 8 0 018-8v8H4z'></path>
                                    </svg>
                                ) : (
                                    'Continuar'
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}