"use client"

import { ErrorMessage } from "@hookform/error-message";
import { FormError } from "../form/form-error";
import { FormSuccess } from "../form/form-success";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { CreateCategorySchema, EditCategorySchema } from "@/utils/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CourseCategoryData } from "@/utils/types";
import SubmitButton from "../submitButton";
import Modal from "../modal";
import { useRouter } from 'next/navigation';
import { edit, register as registerCategory } from "@/actions/category/register";


interface CategoryFormProps<T> {
    data: T;
}

export const CategoryCreateEditForm = ({ data }: CategoryFormProps<CourseCategoryData>) => {
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const schemaRequired = data.id ? EditCategorySchema : CreateCategorySchema;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<z.infer<typeof schemaRequired>>({
        resolver: zodResolver(schemaRequired),
        defaultValues: {
            name: data.name
        }
    });

    useEffect(() => {
        const initializeForm = async () => {
            try {
                reset({
                    name: data.name
                });
            } catch (error) {
                console.error("Error al inicializar el formulario:", error);
            }
        };

        initializeForm();
    }, [data, reset]);


    const onSubmit = (formData: z.infer<typeof schemaRequired>) => {
        setIsLoading(true);
        setError('');
        setSuccess('');

        // Actualizamos los datos con el número de teléfono completo
        try {
            if (!data.id) {
                registerCategory({ data: { ...formData } }).then((data) => {
                    setIsLoading(false);
                    if (data?.success) {
                        setSuccess(data.message);
                        setIsOpen(true);
                    } else {
                        setError(data.error);
                    }
                }).catch(() => setError('Algo ha pasado, intenta mas tarde!'));
            } else {
                edit({ data: { ...formData, id: data.id } }).then((data) => {
                    setIsLoading(false);
                    if (data?.success) {
                        setSuccess(data.message);
                        setIsOpen(true);
                    } else {
                        setError(data.error);
                    }
                }).catch(() => setError('Algo ha pasado, intenta mas tarde!'));
            }
        } catch (error) {
            setError('Algo ha pasado, intenta mas tarde!');
            console.error(error);
        }
    };

    const handleModalClose = () => {
        setIsOpen(false);
        router.push('/admin/categories');
    };

    return (
        <div className={cn('flex flex-col bg-white p-10')}>
            <h1 className={cn('text-2xl font-semibold mb-4 text-left w-full max-w-lg')}>
                Datos Básicos
            </h1>
            <div className={cn('relative mb-4')}>
                <FormError error={error} />
                <FormSuccess message={success} />
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className={cn('w-full max-w-lg min-w-[20rem]')}>
                <div className={cn('flex flex-wrap -mx-2 mb-4')}>
                    <div className={cn('w-full px-2 ')}>
                        <input
                            type='text'
                            placeholder='Nombre'
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
                </div>
                <SubmitButton disabled={!isDirty} isLoading={isLoading} label={!data.id ? 'Crear' : 'Editar'} />
            </form>
            <div>
                <Modal open={isOpen} setOpen={handleModalClose}>
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
                                    <p>Categoria {data.id ? 'editada' : 'creada'} correctamente!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
}