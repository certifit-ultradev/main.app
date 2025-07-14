"use client"

import { ErrorMessage } from "@hookform/error-message";
import { FormError } from "../form/form-error";
import { FormSuccess } from "../form/form-success";
import { cn } from "@/lib/utils";
import { CheckIcon, XIcon } from "../svg/certifit-icons";
import { Controller, useForm } from "react-hook-form";
import PhoneInput from "react-phone-input-2";
import { useEffect, useState } from "react";
import { CreateUserSchema, EditUserSchema } from "@/utils/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserCreateData } from "@/utils/types";
import { register as createUser, edit as editUser } from "@/actions/user/register"
import SubmitButton from "../submitButton";
import Modal from "../modal";
import { useRouter } from 'next/navigation';


interface UserFormProps<T> {
    data: T;
}

export const UserCreateEditForm = ({ data }: UserFormProps<UserCreateData>) => {
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const schemaRequired = data.id ? EditUserSchema : CreateUserSchema;

    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        formState: { errors, isDirty },
    } = useForm<z.infer<typeof schemaRequired>>({
        resolver: zodResolver(schemaRequired),
        defaultValues: {
            name: data.name,
            lastName: data.lastName,
            email: data.email,
            phoneNumber: data.phoneNumber,
        }
    });

    useEffect(() => {
        const initializeForm = async () => {
            try {
                reset({
                    name: data.name,
                    lastName: data.lastName,
                    email: data.email,
                    phoneNumber: data.phoneNumber,
                });

            } catch (error) {
                console.error("Error al inicializar el formulario:", error);
            }
        };

        initializeForm();
    }, [data, reset]);

    const password = watch('password', '') ?? "";

    const hasUppercase = /[A-Z]/.test(password ?? '');
    const hasNumber = /\d/.test(password ?? '');
    const hasMinLength = password.length >= 8;

    const onSubmit = (formData: z.infer<typeof schemaRequired>) => {
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            if (!data.id) {
                const userDataForApi: UserCreateData = {
                    name: formData.name as string,
                    lastName: formData.lastName as string,
                    email: formData.email as string,
                    phoneNumber: formData.phoneNumber as string,
                    password: formData.password as string,
                    confirmPassword: formData.confirmPassword as string
                };

                createUser({data:{ ...userDataForApi }}).then((data) => {
                    setIsLoading(false);
                    if (data?.success) {
                        setSuccess(data.message);
                        setIsOpen(true);
                    } else {
                        setError(data.message);
                    }
                }).catch(() => setError('Algo ha pasado, intenta mas tarde!'));
            } else {
                editUser({data:{id:data.id, userData:{ ...formData }}}).then((data) => {
                    setIsLoading(false);
                    if (data?.success) {
                        setSuccess(data.message);
                        setIsOpen(true);
                    } else {
                        setError(data.message);
                    }
                }).catch(() => {
                    setIsLoading(false);
                    setError('Algo ha pasado, intenta mas tarde!')
                });
            }
        } catch (error) {
            console.error("Error:", error);
            setError('Algo ha pasado, intenta mas tarde!');
        }
    };

    const handleModalClose = () => {
        setIsOpen(false);
        router.push('/admin/users');
    };

    return (
        <div className={cn('flex flex-col bg-white p-10')}>
            <h1 className={cn('text-2xl font-semibold mb-4 text-left w-full max-w-lg')}>
                Datos Básicos
            </h1>
            <span className={cn('text-gray-500 mb-6 text-left w-full max-w-lg')}>
                Proporcione su nombre completo y dirección de correo electrónico para comenzar a crear su cuenta.
            </span>
            <div className={cn('relative mb-4')}>
                <FormError error={error} />
                <FormSuccess message={success} />
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className={cn('w-full max-w-lg min-w-[20rem]')}>
                <div className={cn('flex flex-wrap -mx-2 mb-4')}>
                    <div className={cn('w-full md:w-1/2 px-2 ')}>
                        <input
                            type='text'
                            placeholder='Nombres'
                            {...register('name')}
                            className={cn('w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0BBBE7]')}
                        />
                        <ErrorMessage
                            errors={errors}
                            name='name'
                            render={({ message }) => (
                                <p className={cn('text-red-500 text-sm text-left w-full')}>
                                    {message}
                                </p>
                            )}
                        />
                    </div>
                    <div className={cn('w-full md:w-1/2 px-2 mt-4 md:mt-0')}>
                        <input
                            type='text'
                            {...register('lastName')}
                            placeholder='Apellidos'
                            className={cn('w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0BBBE7]')}
                        />
                        <ErrorMessage
                            errors={errors}
                            name='lastName'
                            render={({ message }) => (
                                <p className={cn('text-red-500 text-sm text-left w-full')}>
                                    {message}
                                </p>
                            )}
                        />
                    </div>
                </div>
                <div className={cn('flex flex-wrap mb-4')}>
                    <input
                        type='text'
                        placeholder='Correo electrónico'
                        {...register('email')}
                        className={cn('w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0BBBE7]')}
                    />
                    <ErrorMessage
                        errors={errors}
                        name='email'
                        render={({ message }) => (
                            <p className={cn('text-red-500 text-sm text-left w-full')}>
                                {message}
                            </p>
                        )}
                    />
                </div>
                <div className={cn('flex flex-wrap mb-4')}>
                    <div className={cn('w-full')}>
                        <Controller
                            control={control}
                            name='phoneNumber'
                            render={({ field }) => (
                                <PhoneInput
                                    country={'co'}
                                    value={field.value}
                                    onChange={(value) => field.onChange(value)}
                                    inputClass={cn(
                                        'w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0BBBE7]'
                                    )}
                                    containerClass={cn('w-full')}
                                    inputProps={{
                                        name: 'phoneNumber',
                                        required: true,
                                    }}
                                    specialLabel=''
                                />
                            )}
                        />
                        <ErrorMessage
                            errors={errors}
                            name='phoneNumber'
                            render={({ message }) => (
                                <p className={cn('text-red-500 text-sm text-left w-full')}>{message}</p>
                            )}
                        />
                    </div>
                </div>
                <span className={cn('text-gray-500 mb-6 text-left w-full max-w-lg')}>Ingrese una contraseña segura para su cuenta</span>
                <div className={cn('flex flex-wrap mb-4')}>
                    <input type='password' {...register('password')} placeholder='Contraseña' className={cn('w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0BBBE7]')} />
                    <ErrorMessage
                        errors={errors}
                        name='password'
                        render={({ message }) => (
                            <p className={cn('text-red-500 text-sm text-left w-full')}>
                                {message}
                            </p>
                        )} />
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
                    <input type='password' {...register('confirmPassword')} placeholder='Confirmar contraseña' className={cn('w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0BBBE7]')} />
                    <ErrorMessage
                        errors={errors}
                        name='confirmPassword'
                        render={({ message }) => (
                            <p className={cn('text-red-500 text-sm text-left w-full')}>
                                {message}
                            </p>
                        )} />
                </div>
                <SubmitButton disabled={!isDirty} isLoading={isLoading} label={!data.id ? 'Crear' : 'Editar'} />
            </form>
            <div>
                <Modal open={isOpen} setOpen={handleModalClose} closeButton={true}>
                    <div>
                        <div className={cn('sm:flex sm:items-start')}>
                            <div className={cn('text-center sm:text-left w-full')}>
                                <div className={cn('grid px-4 py-3 justify-items-center items-center sm:px-6')}>
                                    <div className={cn('rounded-2xl flex items-center justify-center w-[89px] h-[89px] bg-[#EBF9EE]')}>
                                        <div className={cn('rounded-2xl flex items-center justify-center w-[65px] h-[65px] bg-[#CEF4D7]')}>
                                            <svg className={cn('text-5xl text')} width='56' height='57' viewBox='0 0 56 57' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                                <path d='M28.0325 5.16406C15.1455 5.16406 4.69922 15.6104 4.69922 28.4974C4.69922 41.3843 15.1455 51.8307 28.0325 51.8307C39.8859 51.8307 49.8352 42.9453 51.2212 31.2693C51.3705 29.9883 50.4582 28.7961 49.1772 28.6421C47.8985 28.4927 46.7039 29.405 46.5545 30.686C45.4462 40.0193 37.5152 47.164 28.0325 47.164C17.7239 47.164 9.36588 38.806 9.36588 28.4974C9.36588 18.1887 17.7239 9.83072 28.0325 9.83072C30.1862 9.83072 32.3189 10.2204 34.3045 10.925C35.5179 11.3544 36.7895 10.68 37.2212 9.46671C37.6505 8.25104 37.0485 6.90709 35.8352 6.47542C33.3525 5.59576 30.7182 5.16406 28.0325 5.16406ZM49.0325 9.83072C48.4352 9.83072 47.8099 10.0407 47.3549 10.4864L27.0105 30.539C26.4109 31.1294 25.8065 31.015 25.3352 30.3197L23.0019 26.8921C22.2879 25.8397 20.7899 25.534 19.7212 26.2364C18.6502 26.9387 18.3492 28.3924 19.0632 29.4447L21.3966 32.8724C23.4989 35.9733 27.6125 36.384 30.2935 33.7474L50.7102 13.7694C51.6202 12.8734 51.6202 11.3824 50.7102 10.4864C50.2552 10.0384 49.6298 9.83072 49.0325 9.83072Z' fill='#3BAE56' />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className={cn('grid px-4 py-3 justify-items-center items-center sm:px-6')}>
                                    <p>Usuario {data.id ? 'editado' : 'creado'} correctamente!</p>
                                </div>
                                <div className={cn('grid px-4 bg-[#F5F8FE] py-3 justify-items-center items-center sm:px-6')}>
                                    {data.id ? 'Si no has activado el usuario' : ''}Recuerda activarlo desde el menu de acciones!
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
}