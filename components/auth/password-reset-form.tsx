"use client"

import { cn } from "@/lib/utils";
import { FormError } from "../form/form-error";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetSchema } from "@/utils/schemas";
import { ErrorMessage } from "@hookform/error-message";
import { resetPassword } from "@/actions/auth/reset-password";
import SubmitButton from "../submitButton";
import { FormSuccess } from "../form/form-success";

export const PasswordResetForm = () => {
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [, startTransition] = useTransition();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<z.infer<typeof ResetSchema>>({
        resolver: zodResolver(ResetSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = (fromData: z.infer<typeof ResetSchema>) => {
        setError("");
        setSuccess("");
        setIsLoading(true);

        startTransition(() => {
            resetPassword(fromData).then((result) => {
                setIsLoading(false);
                console.log("result reset", result);
                if (result.success) {
                    setSuccess(result.message);
                } else {
                    setError(result.message);
                }
            });
        });
    }

    return (
        <div className={cn('flex flex-col justify-center items-center bg-white p-10 mt-10')}>
            <h1 className={cn('text-2xl font-semibold mb-4 text-left w-full max-w-lg')}>
                Restablecer contraseña
            </h1>
            <span className={cn('text-gray-500 mb-6 text-left w-full max-w-lg')}>
                Escribe tu correo electrónico y te enviaremos un código para restablecer tu contraseña.
            </span>

            <form onSubmit={handleSubmit(onSubmit)} className={cn('w-full max-w-lg min-w-[20rem]')}>
                <div className={cn('w-full mb-2')}>
                    <input
                        type='text'
                        placeholder='Email'
                        {...register('email')}
                        className={cn('w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0BBBE7]')}
                    />
                    <ErrorMessage
                        errors={errors}
                        name="email"
                        render={({ message }) => (
                            <p className={cn('text-red-500 text-sm text-left w-full')}>{message}</p>
                        )}
                    />
                </div>

                <div className={cn('relative mb-4')}>
                    <FormError error={error} />
                    <FormSuccess message={success} />
                </div>
                <SubmitButton disabled={isLoading} isLoading={isLoading} label='Enviar' customClass={cn('mt-6 w-full bg-[#0BBBE7] text-white rounded-full hover:bg-[#009fdf] transition-colors')} />
            </form>
        </div>
    );
}