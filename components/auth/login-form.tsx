'use client';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useTransition } from 'react';
import { login } from '@/actions/auth/login';
import Image from 'next/image';
import { Button } from '@nextui-org/react';
import { ErrorMessage } from '@hookform/error-message';
import { LoginSchema } from '@/utils/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormError } from '@/components/form/form-error';
import { FormSuccess } from '@/components/form/form-success';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import CircularProgress from '../circular-progress-bar';
import { BoardIcon, LaptopIcon } from '../svg/certifit-icons';

export const LoginForm = () => {
    const [error, setError] = useState<string | undefined>('');
    const [success, setSuccess] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl');
    const {
        reset,
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
    });

    const onSubmit = (values: z.infer<typeof LoginSchema>) => {
        setError('');
        setSuccess('');
        startTransition(() => {
            login(values, callbackUrl)
                .then((data) => {
                    if (data?.error) {
                        setError(data.error);
                    }
                    if (data?.success) {
                        reset();
                        setSuccess(data.message);
                    }
                }).catch((e) => {
                    setError('Algo ha pasado, intenta mas tarde!');
                    console.error(e);
                });
        });
    };

    return (
        <div className={cn('flex h-screen bg-gray-100')}>
            <div className={cn('flex flex-col justify-center items-center w-1/2 bg-white p-10')}>
                <Image
                    src='/logo.png'
                    alt='logo'
                    width={200}
                    height={38}
                    className={cn('w-20 mb-6 text-left invert')}
                    unoptimized={true}
                    priority
                />

                <h2 className={cn('text-2xl font-semibold mb-4 text-left w-full max-w-lg')}>
                    Bienvenido a Certifit
                </h2>
                <p className={cn('text-gray-500 mb-6 text-left w-full max-w-lg')}>
                    Introduce tu usuario y contraseña para continuar
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className={cn('w-full max-w-lg min-w-[20rem]')}>
                    <div className={cn('relative mb-4')}>
                        <input
                            type='email'
                            placeholder='Correo electrónico'
                            className={cn('w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0BBBE7]')}
                            {...register('email')}
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

                    <div className={cn('relative mb-4')}>
                        <input
                            type={isPasswordVisible ? "text" : "password"}
                            placeholder='Contraseña'
                            className={cn('w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0BBBE7]')}
                            {...register('password')}
                        />
                        <ErrorMessage
                            errors={errors}
                            name='password'
                            render={({ message }) => (
                                <p className={cn('text-red-500 text-sm text-left w-full')}>
                                    {message}
                                </p>
                            )}
                        />
                        <button
                            type="button"
                            onClick={() => setIsPasswordVisible((prev) => !prev)}
                            className={cn(
                                "absolute right-3 top-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                            )}
                        >👁️</button>
                    </div>

                    <div className={cn('flex justify-between items-center mb-4 text-sm')}>
                        <label className={cn('flex items-center text-gray-500')}>
                            <input type='checkbox' className={cn('mr-2')} />
                            Recuérdame
                        </label>
                        <a href='/reset-password' className={cn('text-[#0BBBE7] hover:underline')}>
                            Recuperar contraseña
                        </a>
                    </div>
                    <div className={cn('relative mb-4')}>
                        <FormError error={error} />
                        <FormSuccess message={success} />
                    </div>
                    <Button
                        type='submit'
                        isLoading={isPending}
                        isDisabled={isPending}
                        color='primary'
                        className={cn('w-full bg-[#0BBBE7] text-white py-2 rounded-full hover:bg-[#009fdf] transition-colors')}
                        fullWidth
                    >
                        Ingresar
                    </Button>
                </form>

                <p className={cn('mt-6 text-sm text-gray-500')}>
                    ¿No tienes cuenta aún?{' '}
                    <a href='/register' className={cn('text-[#0BBBE7] hover:underline')}>
                        Regístrate
                    </a>
                </p>
            </div>

            {/* Sección de Información */}
            <div className={cn('relative w-full md:w-1/2 lg:w-1/2 mt-10 md:mt-0 flex justify-center md:justify-center flex-col items-center bg-gray-900 text-white')}>
                <div className={cn('relative w-[30rem] h-[30rem]')}>
                    <div className={cn('absolute inset-0 rounded-full border-[16px] border-gray-800')}></div>
                    <Image src="/trainer_1.png"
                        width={500}
                        height={500}
                        alt="Entrenador"
                        unoptimized={true}
                        className={cn('relative z-9 rounded-full w-[30rem] h-[30rem] object-cover')} />

                    <div className={cn('absolute top-0 left-[-1rem] bg-white text-black p-4 rounded-lg shadow-md flex items-center space-x-1')}>
                        <div className={cn('flex items-center justify-center w-12 h-12 bg-[#0BBBE7] rounded-xl')}><LaptopIcon width={36} height={34} className={cn('')} /></div>
                        <div className={cn('flex flex-col text-md font-medium')}>
                            <span>1K+</span>
                            <span className={cn('text-gray-700')}>Videos</span>
                        </div>
                    </div>

                    <div className={cn('absolute top-1/2 right-[-3rem] sm:right-[-4rem] bg-white text-black p-4 rounded-xl shadow-md flex flex-col items-center space-y-1 w-max transform -translate-y-1/2')}>
                        <div className={cn('w-14 h-14')}><CircularProgress progress={80} size={60} strokeWidth={8} /></div>
                        <span className={cn('text-md font-medium text-gray-700')}>Cursos online</span>
                    </div>

                    <div className={cn('absolute bottom-0 left-0 sm:left-[-2rem] bg-white text-black p-4 rounded-xl shadow-md flex items-center space-x-2 w-max')}>
                        <div className={cn('flex items-center justify-center w-12 h-12 bg-[#0BBBE7] rounded-xl')}><BoardIcon width={36} height={34} className={cn('')} /></div>
                        <div className={cn('flex flex-col text-md font-medium')}>
                            <span>Variedad</span>
                            <span className={cn('text-gray-700')}>Tutores</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}