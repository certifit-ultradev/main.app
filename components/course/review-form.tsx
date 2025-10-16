import { edit, editClassVideoPath, register } from '@/actions/courses/register';
import { CourseData, CourseModule, ServerActionResponse } from '@/utils/types';
import { calculateTotalVideoDuration, calculateTotalVideoSize, formatVideoDuration, formatVideoSize } from '@/utils/video';
import Modal from '../modal';
import { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import _ from 'lodash';
import { uploadFile } from '@/utils/upload-file-blob';
import SubmitButton from '../submitButton';
import { Button } from '@nextui-org/react';
import { FormError } from '../form/form-error';
import { v4 as uuidv4 } from 'uuid'; // Add this import for generating unique IDs

interface CourseReviewFormProps {
    data: CourseData;
    originalData: CourseData;
    nextStep: () => void;
    previousStep: () => void;
};

// Define the type for video upload status
interface VideoUploadStatus {
    id: string; // Unique identifier for each video
    fileName: string;
    status: 'Ready to Upload' | 'Uploading' | 'Uploaded';
}

export const CourseReviewForm = ({ data, originalData, previousStep }: CourseReviewFormProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [videoStatuses, setVideoStatuses] = useState<VideoUploadStatus[]>([]);
    const courseId = useRef<number | null | undefined>(null);

    const router = useRouter();

    useEffect(() => {
        // Initialize video statuses when data changes
        const initialStatuses: VideoUploadStatus[] = [];
        data.modules?.forEach((module) => {
            module.classes?.forEach((cls) => {
                if (cls.video instanceof File) {
                    initialStatuses.push({ id: uuidv4(), fileName: cls.video.name, status: 'Ready to Upload' });
                }
            });
        });
        setVideoStatuses(initialStatuses);
    }, [data]);

    // Utility function to limit concurrent uploads
    const uploadWithLimit = async (tasks: (() => Promise<void>)[], limit: number) => {
        const results = [];
        const executing: Promise<void>[] = [];

        for (const task of tasks) {
            const promise = task().then(() => {
                executing.splice(executing.indexOf(promise), 1);
            });
            results.push(promise);
            executing.push(promise);

            if (executing.length >= limit) {
                await Promise.race(executing);
            }
        }

        return Promise.all(results);
    };

    const updateVideoStatus = (id: string, newStatus: 'Ready to Upload' | 'Uploading' | 'Uploaded') => {
        setVideoStatuses((prevStatuses) =>
            prevStatuses.map((video) =>
                video.id === id ? { ...video, status: newStatus } : video
            )
        );
    };

    const onSubmit = async () => {
        setIsLoading(true);
        setError('');

        try {
            const finalCourseId = courseId.current;
            if (!data.id) {
                let result: ServerActionResponse<CourseData | null>;
                if (!finalCourseId) {
                    const dataWithOutFiles = _.cloneDeep(data);
                    dataWithOutFiles.modules = dataWithOutFiles.modules?.map<CourseModule>((module) => {
                        module.classes = module.classes?.map((cls) => {
                            cls.video = null;
                            return cls;
                        });
                        return module;
                    });
                    result = await register({ data: dataWithOutFiles });
                    if (!result.success) {
                        setIsLoading(false);
                        setError(result.error ?? 'Error al crear el curso');
                        return;
                    }
                    courseId.current = result.payload?.id;
                }

                const uploadTasks: (() => Promise<void>)[] = [];
                data.modules?.forEach((module, mIndex) => {
                    module.classes?.forEach((cls, clsIndex) => {
                        const file: File = cls.video as File;
                        if (file) {
                            const videoId = videoStatuses.find((video) => video.fileName === file.name)?.id;
                            uploadTasks.push(async () => {
                                if (videoId) updateVideoStatus(videoId, 'Uploading');
                                const putBlobResult = await uploadFile(`/courses/${!finalCourseId ? courseId.current : finalCourseId}/`, file);
                                const clsCreatedId = result?.payload?.modules?.[mIndex]?.classes?.[clsIndex]?.id;
                                if (!clsCreatedId) {
                                    setIsLoading(false);
                                    setError('fallo la creación de la clase');
                                    return;
                                }

                                await editClassVideoPath({
                                    data: {
                                        clsId: clsCreatedId, videoPath: putBlobResult.url, videoSize: file.size
                                    }
                                });
                                if (videoId) updateVideoStatus(videoId, 'Uploaded');
                            });
                        }
                    });
                });

                await uploadWithLimit(uploadTasks, 1); // Limit to 2 concurrent uploads
                setIsLoading(false);
                setIsOpen(true);
            } else {
                const dataWithOutFiles = _.cloneDeep(data);
                dataWithOutFiles.modules = dataWithOutFiles.modules?.map<CourseModule>((module) => {
                    module.classes = module.classes?.map((cls) => {
                        if (cls.video instanceof File) {
                            cls.video = null;
                        }
                        return cls;
                    });
                    return module;
                });

                const uploadTasks: (() => Promise<void>)[] = [];
                data.modules?.forEach((module, mIndex) => {
                    module.classes?.forEach((cls, clsIndex) => {
                        const file = cls.video;
                        if (file instanceof File) {
                            const videoId = videoStatuses.find((video) => video.fileName === file.name)?.id;
                            uploadTasks.push(async () => {
                                if (videoId) updateVideoStatus(videoId, 'Uploading');
                                const putBlobResult = await uploadFile(`/courses/${data.id}/`, file);
                                if (dataWithOutFiles.modules &&
                                    dataWithOutFiles.modules[mIndex] &&
                                    dataWithOutFiles.modules[mIndex].classes &&
                                    dataWithOutFiles.modules[mIndex].classes[clsIndex]) {
                                    dataWithOutFiles.modules[mIndex].classes[clsIndex].video = putBlobResult.url;
                                    dataWithOutFiles.modules[mIndex].classes[clsIndex].videoSize = file.size;
                                } else {
                                    setError("La estructura en dataWithOutFiles no existe para actualizar la URL del video.");
                                    console.error("La estructura en dataWithOutFiles no existe para actualizar la URL del video.", { mIndex, clsIndex });
                                }
                                if (videoId) updateVideoStatus(videoId, 'Uploaded');
                            });
                        }
                    });
                });

                await uploadWithLimit(uploadTasks, 1); // Limit to 2 concurrent uploads
                const editResult = await edit({ data: { originalCourseData: originalData, newCourseData: dataWithOutFiles } });
                setIsLoading(false);
                if (editResult.success) {
                    setIsOpen(true);
                } else {
                    const errorMessage = editResult.message ?? '';
                    setError(errorMessage);
                }
            }
        } catch (err) {
            console.error("Error:", err);
            setIsLoading(false);
            setError('Ocurrió un error, intente más tarde. Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    }

    const handleModalClose = () => {
        setIsOpen(false);
        router.push('/admin');
    };

    return (
        <div className={cn('w-full max-w-lg min-w-0 md:min-w-[50rem] lg:min-w-[90rem]')}>
            <div className={cn('relative mb-4')}>
                <FormError error={error} />
            </div>
            <div><h1 className={cn('text-lg font-semibold mb-4')}>Resumen del Curso</h1></div>
            <div className={cn('border border-gray-300 p-4 rounded-md')}>

                <p className={cn('mb-2')}>Nombre del curso: <strong>{data.title}</strong></p>
                <p className={cn('mb-2')}>Precio: ${data.price}</p>
                <p className={cn('mb-2')}>Instructor: <strong>{data.instructorName}</strong></p>
                <p className={cn('mb-2')}>Categoría: <strong>{data.category?.name}</strong></p>
                <p className={cn('mb-2')}>Peso del curso: {formatVideoSize(calculateTotalVideoSize(data.modules ?? []))} GB</p>
                <p className={cn('mb-2')}>Duración del curso: {formatVideoDuration(calculateTotalVideoDuration(data.modules ?? []))}</p>
                <p className={cn('mb-4')}>
                    {data.description}
                </p>
                <p className={cn('mb-4 text-gray-700')}>
                    Este curso estará activo hasta el <strong>{data.expiresAt.toString()}</strong>
                </p>

                <div className={cn('mb-4')}>
                    <h2 className={cn('text-md font-semibold mb-2')}>Estado de los Videos</h2>
                    <ul>
                        {videoStatuses.map((video) => (
                            <li key={video.id} className={cn('mb-1')}>
                                {video.fileName}: <strong>{video.status}</strong>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className={cn('flex justify-between items-center mt-6')}>
                    <div className={cn('text-center')}>
                        <h4 className={cn('text-2xl font-bold')}>{data.modules?.length}</h4>
                        <p className={cn('text-gray-500')}>Módulos</p>
                    </div>
                    <div className={cn('text-center')}>
                        <h4 className={cn('text-2xl font-bold')}>{data.modules?.reduce((total, module) => total + (module?.classes?.length ?? 0), 0)}</h4>
                        <p className={cn('text-gray-500')}>Clases</p>
                    </div>
                    <div className={cn('text-center')}>
                        <h4 className={cn('text-2xl font-bold')}>{data.modules?.reduce((total, module) => total + ((module?.quiz?.questions?.length ?? 0) > 0 ? 1 : 0), 0)}</h4>
                        <p className={cn('text-gray-500')}>Evaluaciones</p>
                    </div>
                </div>
                <div className={cn('flex justify-between mt-8')}>
                    <Button
                        type='button'
                        disabled={isLoading}
                        className={cn('border border-[#0BBBE7] text-[#0BBBE7] px-6 py-2 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1', {
                            'opacity-50 cursor-not-allowed': isLoading
                        })}
                        onClick={previousStep}
                    >
                        Atrás
                    </Button>
                    <SubmitButton onClick={onSubmit} disabled={isLoading} isLoading={isLoading} label={!data.id ? 'Crear' : 'Editar'} customClass={cn('bg-[#0BBBE7] text-white px-6 py-2 rounded-md hover:bg-[#009fdf] transition-colors flex items-center gap-2')} />
                </div>
            </div>
            <div>
                <Modal open={isOpen} setOpen={handleModalClose} closeButton={false}>
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
                                    <p>¡El {data.title} ha sido publicado exitosamente!</p>
                                </div>
                                <div className={cn('grid px-4 bg-[#F5F8FE] py-3 justify-items-center items-center sm:px-6')}>
                                    Podrás encontrarlo en la lista de cursos
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
}
