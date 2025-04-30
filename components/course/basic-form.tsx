"use client"

import { listAllCourseCategories } from '@/actions/category/list';
import { cn } from '@/lib/utils';
import { CourseBasicInfoSchema } from '@/utils/schemas';
import { CourseCategoryData, CourseData, ErrMap } from '@/utils/types';
import { ErrorMessage } from '@hookform/error-message';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { z } from 'zod';
import { Button } from '../ui/button';
import _ from 'lodash';
import { mapZodErrors } from '@/utils/zod-errors-mapper';

interface CourseBasicFormProps {
    data: CourseData;
    setData: Dispatch<SetStateAction<CourseData>>;
    nextStep: () => void;
};

export const CourseBasicForm = ({ data, setData, nextStep }: CourseBasicFormProps) => {
    const [errors, setErrors] = useState<ErrMap>({});
    const [categories, setCategories] = useState<CourseCategoryData[]>([]);// Estado para categorías

    useEffect(() => {
        const initializeForm = async () => {
            try {
                const result = await listAllCourseCategories();
                setCategories(result.payload ?? []);
            } catch (error) {
                console.error("Error al inicializar el formulario:", error);
            }
        };

        initializeForm();
    }, []);

    const onSubmit = () => {
        if (validateBasicData()) {
            nextStep();
        }
    }



    const validateBasicData = () => {
        try {
            CourseBasicInfoSchema.parse(data);
        } catch (e) {
            if (e instanceof z.ZodError) {
                setErrors(mapZodErrors(e));
            }
            return false;
        }
        return true;
    };

    const handleBasicDataChange = <K extends keyof CourseData>(
        field: K,
        value: CourseData[K],
    ) => {
        setData((prevData) => {
            const newData = _.cloneDeep(prevData);
            newData[field] = value;
            return newData;
        });
    };

    const handleFileBasicDataChange = <K extends keyof CourseData>(
        field: K,
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setData((prevData) => {
            const newData = _.cloneDeep(prevData);
            newData[field] = file as CourseData[K];
            return newData;
        });
    };

    const handleCategoryBasicDataChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = e.target.selectedOptions;
        if (e.target.value != "" && options[0]) {
            setData((prevData) => {
                const newData = _.cloneDeep(prevData);
                newData['category'] = {
                    id: Number(e.target.value),
                    name: options[0].text
                };
                return newData;
            });
        }
    };

    return (
        <div className={cn('w-full lg:w-3/4')}>
            <div className={cn('mb-6')}>
                <h2 className={cn('text-2xl font-semibold')}>Información Básica</h2>
                <p className={cn('text-gray-600')}>Ingresa la información general del curso</p>
            </div>

            {/* Form Fields */}
            <div className={cn('space-y-6')} >
                <div>
                    <label className={cn('block text-sm font-medium text-gray-700 mb-2"')} htmlFor="title">
                        Nombre de curso *
                    </label>
                    <input type="text" id="title" placeholder="[Nombre de curso]" onChange={(e) => handleBasicDataChange('title', e.target.value)} value={data.title}
                        className={cn('w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0BBBE7]')} />
                    <ErrorMessage
                        errors={errors}
                        name='title'
                        render={({ message }) => (
                            <p className={cn('text-red-500 text-sm text-left w-full')}>
                                {message}
                            </p>
                        )}
                    />
                </div>
                <div className={cn('border-dashed border-2 border-gray-300 rounded-md p-4')}>
                    {(data.id != 0 && data.courseImage) && (
                        <div className={cn('mb-4')}>
                            <p className={cn('text-sm text-gray-700')}>
                                Imagen cargada:{" "}
                                <a href={typeof data.courseImage === "string" ? data.courseImage : ""} target="_blank" rel="noopener noreferrer" className={cn('text-[#0BBBE7] underline')}>
                                    Ver imagen
                                </a>
                            </p>
                            <p className={cn('text-sm text-gray-500')}>Puedes reemplazar este archivo subiendo uno nuevo.</p>
                        </div>
                    )}
                    <label className={cn('block text-sm font-medium text-gray-700 mb-2"')} htmlFor="courseImage">
                        Imagen del curso
                    </label>
                    <input type="file" id="courseImage" placeholder="[Imagen del curso]" onChange={(e) => handleFileBasicDataChange('courseImage', e)}
                        className={cn('block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:bg-blue-50 file:text-[#0BBBE7] hover:file:bg-blue-100')}
                    />
                    <ErrorMessage
                        errors={errors}
                        name='courseImage'
                        render={({ message }) => (
                            <p className={cn('text-red-500 text-sm text-left w-full')}>
                                {message}
                            </p>
                        )}
                    />
                </div>
                <div>
                    <label className={cn('block text-sm font-medium text-gray-700 mb-2"')} htmlFor="price">
                        Precio *
                    </label>
                    <input type="number" min="1" id="price" placeholder="$135.000" onChange={(e) => handleBasicDataChange('price', Number(e.target.value))} value={data.price}
                        className={cn('w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0BBBE7]')} />
                    <ErrorMessage
                        errors={errors}
                        name='price'
                        render={({ message }) => (
                            <p className={cn('text-red-500 text-sm text-left w-full')}>
                                {message}
                            </p>
                        )}
                    />
                </div>

                <div>
                    <label className={cn('block text-sm font-medium text-gray-700 mb-2"')} htmlFor="instructorName">
                        Instructor *
                    </label>
                    <input type="text" id="instructorName" placeholder="[Nombre de instructor]" onChange={(e) => handleBasicDataChange('instructorName', e.target.value)} value={data.instructorName}
                        className={cn('w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0BBBE7]')} />
                    <ErrorMessage
                        errors={errors}
                        name='instructorName'
                        render={({ message }) => (
                            <p className={cn('text-red-500 text-sm text-left w-full')}>
                                {message}
                            </p>
                        )}
                    />
                </div>

                <div className={cn('border-dashed border-2 border-gray-300 rounded-md p-4')}>
                    {(data.id != 0 && data.instructorPhoto) && (
                        <div className={cn('mb-4')}>
                            <p className={cn('text-sm text-gray-700')}>
                                Imagen cargada:{" "}
                                <a href={typeof data.instructorPhoto === "string" ? data.instructorPhoto : ""} target="_blank" rel="noopener noreferrer" className={cn('text-[#0BBBE7] underline')}>
                                    Ver imagen
                                </a>
                            </p>
                            <p className={cn('text-sm text-gray-500')}>Puedes reemplazar este archivo subiendo uno nuevo.</p>
                        </div>
                    )}
                    <label className={cn('block text-sm font-medium text-gray-700 mb-2"')} htmlFor="instructorPhoto">
                        Foto del instructor
                    </label>
                    <input type="file" id="instructorPhoto" placeholder="[Foto del instructor]" onChange={(e) => handleFileBasicDataChange('instructorPhoto', e)} accept="image/png"
                        className={cn('block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:bg-blue-50 file:text-[#0BBBE7] hover:file:bg-blue-100')}
                    />
                    <ErrorMessage
                        errors={errors}
                        name='instructorPhoto'
                        render={({ message }) => (
                            <p className={cn('text-red-500 text-sm text-left w-full')}>
                                {message}
                            </p>
                        )}
                    />
                </div>

                <div>
                    <label className={cn('block text-sm font-medium text-gray-700 mb-2"')} htmlFor="category">
                        Categoría *
                    </label>
                    <select
                        id="category"
                        value={data.category?.id ? data.category.id : ""}
                        onChange={(e) => handleCategoryBasicDataChange(e)}
                        className={cn('w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0BBBE7]')}
                    >
                        <option value="" disabled>
                            -- Selecciona una categoría --
                        </option>
                        {categories.map((category) => (
                            <option key={category.id ?? category.name} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <ErrorMessage
                        errors={errors}
                        name="category.id"
                        render={({ message }) => (
                            <p className={cn('text-red-500 text-sm text-left w-full')}>{message}</p>
                        )}
                    />
                    <ErrorMessage
                        errors={errors}
                        name="category.name"
                        render={({ message }) => (
                            <p className={cn('text-red-500 text-sm text-left w-full')}>{message}</p>
                        )}
                    />
                </div>

                <div>
                    <label className={cn('block text-sm font-medium text-gray-700 mb-2"')} htmlFor="description">
                        Descripción
                    </label>
                    <textarea id="description" rows={4} onChange={(e) => handleBasicDataChange('description', e.target.value)} value={data.description}
                        className={cn('w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0BBBE7]')}
                        placeholder="Descripción..." />
                    <ErrorMessage
                        errors={errors}
                        name='description'
                        render={({ message }) => (
                            <p className={cn('text-red-500 text-sm text-left w-full')}>
                                {message}
                            </p>
                        )}
                    />
                </div>

                <div>
                    <label className={cn('block text-sm font-medium text-gray-700 mb-2"')} htmlFor="expiresAt">
                        Selecciona el rango de fecha en que este curso estará activo *
                    </label>
                    <div className={cn('relative')}>
                        <input type="date" id="expiresAt" onChange={(e) => handleBasicDataChange('expiresAt', e.target.value)} value={data.expiresAt}
                            className={cn('w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0BBBE7]')}
                            placeholder="" />
                        <ErrorMessage
                            errors={errors}
                            name='expiresAt'
                            render={({ message }) => (
                                <p className={cn('text-red-500 text-sm text-left w-full')}>
                                    {message}
                                </p>
                            )}
                        />
                    </div>
                </div>

                <div className={cn('flex justify-end')}>
                    <Button type="submit" onClick={onSubmit}
                        className={cn('bg-[#0BBBE7] text-white px-6 py-2 rounded-md hover:bg-[#009fdf] transition-colors')}>
                        Continuar
                    </Button>
                </div>
            </div>
        </div>
    );
};