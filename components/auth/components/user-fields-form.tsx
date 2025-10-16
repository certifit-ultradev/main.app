'use client';

import { ErrorMessage } from '@hookform/error-message';
import { Control, Controller, FieldErrors, UseFormRegister } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { RegisterUserFirstStep } from '@/utils/types';
import PhoneInput from 'react-phone-input-2';

interface RegisterFormProps {
    errors: FieldErrors<RegisterUserFirstStep>
    control: Control<RegisterUserFirstStep>
    register: UseFormRegister<RegisterUserFirstStep>
};

export const BasicFieldsForm = ({ register, control, errors }: RegisterFormProps) => {
    return (
        <>
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
                <div className={cn('w-full pr-2')}>
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
            {/* Identificación y Tipo de Identificación */}
            <div className={cn('flex flex-wrap -mx-2 mb-4')}>
                <div className={cn('w-full md:w-1/2 px-2')}>
                    <select
                        id='identificationType'
                        {...register('identificationType')}
                        className={cn('w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0BBBE7] appearance-none')}
                        style={{ height: 'calc(3rem + 2px)' }} // Adjust height to match input fields
                    >
                        <option value='CC'>Cédula de Ciudadanía</option>
                        <option value='TI'>Tarjeta de Identidad</option>
                        <option value='CE'>Cédula de Extranjería</option>
                        <option value='NIT'>Número de Identificación Tributaria</option>
                        <option value='PAS'>Pasaporte</option>
                    </select>
                    <ErrorMessage
                        errors={errors}
                        name='identificationType'
                        render={({ message }) => (
                            <p className={cn('text-red-500 text-sm text-left w-full')}>{message}</p>
                        )}
                    />
                </div>
                <div className={cn('w-full md:w-1/2 px-2 ')}>
                    <input
                        type='text'
                        placeholder='Número de Identificación'
                        {...register('identification')}
                        className={cn('w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0BBBE7]')}
                    />
                    <ErrorMessage
                        errors={errors}
                        name='identification'
                        render={({ message }) => (
                            <p className={cn('text-red-500 text-sm text-left w-full')}>
                                {message}
                            </p>
                        )}
                    />
                </div>
            </div>
        </>
    )
}