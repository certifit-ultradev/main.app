"use client"

import { cn } from "@/lib/utils";
import { NewPasswordSchema } from "@/utils/schemas";
import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckIcon, XIcon } from "../svg/certifit-icons";
import { FormError } from "../form/form-error";
import { FormSuccess } from "../form/form-success";
import { startTransition, useState } from "react";
import SubmitButton from "../submitButton";
import { useRouter, useSearchParams } from "next/navigation";
import { newPassword } from "@/actions/auth/new-password";

export const NewPasswordForm = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter();
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<z.infer<typeof NewPasswordSchema>>({
        resolver: zodResolver(NewPasswordSchema),
    });

    const password = watch('password', '');
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasMinLength = password.length >= 8;

    const onSubmit = async (formData: z.infer<typeof NewPasswordSchema>) => {
        setError("");
        setSuccess("");
        setIsLoading(true);
        startTransition(() => {
            newPassword(formData, token).then((result) => {
                setIsLoading(false);
                if (result.success) {
                    setSuccess(result.message);
                    router.push("/dashboard");
                }
                setError(result.error);
            });
        });
    }
    return (
        <div className={cn('justify-center items-center')}>
            <div className={cn('flex flex-col justify-center items-center bg-white p-10')}>
                <form onSubmit={handleSubmit(onSubmit)} className={cn('w-full max-w-lg min-w-[20rem]')}>
                    <h1 className={cn('text-2xl font-semibold mb-4 text-left w-full max-w-lg')}>Ingresa una contraseña</h1>
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
                    <div className={cn('flex flex-wrap mb-4 relative')}>
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
                    <SubmitButton disabled={isLoading} isLoading={isLoading} label='Confirmar' customClass={cn('mt-6 w-full bg-[#0BBBE7] text-white rounded-full hover:bg-[#009fdf] transition-colors')} />
                </form>
            </div>
        </div>
    );
}