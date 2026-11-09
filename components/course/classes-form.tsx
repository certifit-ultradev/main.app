import type {
    CourseEditorClass,
    CourseEditorFormValues,
    CourseEditorOption,
    CourseEditorQuestion,
    CourseEditorQuiz,
} from '@/features/courses/editor/course-editor-form.types';
import { Dispatch, SetStateAction, useEffect, useReducer, useRef, useState } from "react";
import { Tab, TabGroup, TabList, TabPanels, TabPanel } from '@headlessui/react';
import { AddCircleOutline, DeleteForever } from "@mui/icons-material";
import { Button } from '@/components/ui/button';
import { CourseModulesSchema } from '@/features/courses/editor/editor-form.schema.client';
import { z } from "zod";
import { cn } from "@/lib/utils";
import { ErrorMessage } from "@hookform/error-message";
import { mapEditorZodErrors, type EditorErrorMap } from '@/features/courses/editor/editor-form-errors';
import {
    courseEditorModulesReducer,
    hydrateEditorModules,
    type CourseEditorModulesAction,
} from '@/features/courses/editor/course-editor-modules.reducer';

interface CourseBasicFormProps {
    data: CourseEditorFormValues;
    setData: Dispatch<SetStateAction<CourseEditorFormValues>>;
    nextStep: (modules: CourseEditorFormValues['modules']) => Promise<void> | void;
    previousStep: () => void;
    isSaving?: boolean;
    saveError?: string;
    videoUploads?: VideoUploadStatus[];
    contentPhase?: 'idle' | 'uploading' | 'saving' | 'error';
};

export type VideoUploadStatus = {
    key: string;
    moduleIndex: number;
    classIndex: number;
    fileName: string;
    percentage: number;
    status: 'pending' | 'uploading' | 'uploaded' | 'reused' | 'retry';
};

export const CourseClassesForm = ({
    data, setData, nextStep, previousStep, isSaving = false, saveError,
    videoUploads = [], contentPhase = 'idle',
}: CourseBasicFormProps) => {
    const [errors, setErrors] = useState<EditorErrorMap>({});
    const [modules, dispatchModules] = useReducer(courseEditorModulesReducer, data.modules, hydrateEditorModules);
    const uploadProgressRef = useRef<HTMLElement>(null);

    useEffect(() => {
        dispatchModules({ type: 'hydrate', modules: data.modules });
    }, [data.modules]);

    useEffect(() => {
        if (contentPhase === 'uploading') {
            uploadProgressRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [contentPhase]);

    const dispatch = (action: CourseEditorModulesAction) => dispatchModules(action);
    const addModule = () => dispatch({ type: 'addModule' });

    const validateModules = () => {
        try {
            CourseModulesSchema.parse(modules);
            setErrors({});
        } catch (e) {
            if (e instanceof z.ZodError) {
                setErrors(mapEditorZodErrors(e));
            }
            return false;
        }
        return true;
    };

    const removeModule = (moduleIndex: number) => dispatch({ type: 'removeModule', moduleIndex });

    const addClassToModule = (moduleIndex: number) => dispatch({ type: 'addClass', moduleIndex });

    const removeClassFromModule = (moduleIndex: number, classIndex: number) => dispatch({ type: 'removeClass', moduleIndex, classIndex });

    const handleClassChange = <K extends keyof CourseEditorClass>(
        moduleIndex: number,
        classIndex: number,
        field: K,
        value: CourseEditorClass[K],
    ) => {
        if (field === "video" && value instanceof File) {
            const fileURL = URL.createObjectURL(value);

            const video = document.createElement("video");
            video.src = fileURL;
            video.addEventListener("loadedmetadata", () => {
                const vidDuration = video.duration;
                dispatch({ type: 'updateClass', moduleIndex, classIndex, patch: { videoDuration: vidDuration } });

                URL.revokeObjectURL(fileURL);
            });

            video.addEventListener("error", () => {
                setErrors((currentErrors) => ({
                    ...currentErrors,
                    [`${moduleIndex}-classes-${classIndex}-video`]: {
                        type: 'custom',
                        message: 'No fue posible leer los metadatos del video.',
                    },
                }));
                URL.revokeObjectURL(fileURL);
            });
        }

        dispatch({ type: 'updateClass', moduleIndex, classIndex, patch: { [field]: value } });
    };

    const handleModuleTitleChange = (moduleIndex: number, value: string) => {
        dispatch({ type: 'updateModule', moduleIndex, patch: { title: value } });
    };

    const handleModuleMinRequiredPointsChange = (moduleIndex: number, value: string) => {
        dispatch({ type: 'updateModule', moduleIndex, patch: { minRequiredPoints: Number(value) } });
    };

    const handleQuizChange = <K extends keyof Pick<CourseEditorQuiz, 'title' | 'description'>>(
        moduleIndex: number,
        field: K,
        value: CourseEditorQuiz[K],
    ) => {
        dispatch({ type: 'updateQuiz', moduleIndex, patch: { [field]: value } });
    };

    const addQuestionToQuiz = (moduleIndex: number) => dispatch({ type: 'addQuestion', moduleIndex });

    const handleQuestionChange = <K extends keyof Pick<CourseEditorQuestion, 'title' | 'points'>>(
        moduleIndex: number,
        questionIndex: number,
        field: K,
        value: CourseEditorQuestion[K],
    ) => {
        dispatch({ type: 'updateQuestion', moduleIndex, questionIndex, patch: { [field]: value } });
    };

    const addOptionToQuestion = (moduleIndex: number, questionIndex: number) => {
        dispatch({ type: 'addOption', moduleIndex, questionIndex });
    };

    /**
   * 
   * const handleOptionChange = <K extends keyof QuestionOption>(
      moduleIndex: number,
      questionIndex: number,
      optionIndex: number,
      field: K,                     
      value: QuestionOption[K],      
    ) => {
   * 
   * @param moduleIndex 
   * 
   * @param field 
   * @param value 
   */

    const handleOptionChange = <K extends keyof CourseEditorOption>(
        moduleIndex: number,
        questionIndex: number,
        optionIndex: number,
        field: K,
        value: CourseEditorOption[K],
    ) => {
        dispatch({ type: 'updateOption', moduleIndex, questionIndex, optionIndex, patch: { [field]: value } });
    };

    const removeQuestionFromQuiz = (moduleIndex: number, questionIndex: number) => {
        dispatch({ type: 'removeQuestion', moduleIndex, questionIndex });
    };

    const onNextStep = async () => {
        if (validateModules()) {
            setData((prevDatos) => ({ ...prevDatos, modules }));
            await nextStep(modules);
        }
    };

    const onPreviousStep = () => {
        setData((prevDatos) => ({ ...prevDatos, modules }));
        previousStep();
    };

    const moduleHasErrors = (moduleIndex: number): number => {
        const keys = Object.keys(errors);
        let count = 0;

        for (let i = 0; i < keys.length; i++) {
            const moduleKey = keys[i].split('-')[0];
            if (Number(moduleKey) == moduleIndex) {
                count++;
            }
        }
        return count;
    }

    const questionHasErrors = (questionIndex: number, moduleIndex: number) => {
        const keys = Object.keys(errors);
        let count = 0;

        for (let i = 0; i < keys.length; i++) {
            const splitKeys = keys[i].split('-');
            const moduleKey = splitKeys[0];
            if (Number(moduleKey) == moduleIndex) {
                if (keys[i].indexOf('quiz-questions') != -1) {
                    const questionKey = splitKeys[3];
                    if (Number(questionKey) == questionIndex) {
                        count++;
                    }
                }
            }
        }
        return count;
    }

    return (
        <div className={cn('w-full lg:w-3/4')}>
            {(videoUploads.length > 0 || contentPhase === 'uploading' || contentPhase === 'saving') && (
                <section ref={uploadProgressRef} aria-label="Progreso de videos" className="mb-6 scroll-mt-4 rounded-md border border-sky-200 bg-sky-50 p-4">
                    <h2 className="font-semibold">Estado de los videos</h2>
                    <p role="status" aria-live="polite" className="mt-1 text-sm">
                        {contentPhase === 'saving' ? 'Videos subidos. Guardando el contenido del curso...'
                            : contentPhase === 'uploading' ? 'Subiendo videos al almacenamiento...'
                                : contentPhase === 'error' ? 'El intento falló. Se reutilizarán los videos ya subidos; sólo se subirán los faltantes.'
                                    : 'Videos pendientes de subir.'}
                    </p>
                    <ul className="mt-3 space-y-3">
                        {videoUploads.map((video) => (
                            <li key={video.key} className="text-sm">
                                <div className="flex flex-wrap justify-between gap-2">
                                    <span>Módulo {video.moduleIndex + 1}, clase {video.classIndex + 1}: {video.fileName}</span>
                                    <span>{video.status === 'uploaded' ? 'Subido, pendiente de guardar'
                                        : video.status === 'reused' ? (contentPhase === 'error'
                                            ? 'Subido, listo para reintentar' : 'URL reutilizada, pendiente de guardar')
                                        : video.status === 'retry' ? 'Se subirá de nuevo'
                                            : video.status === 'uploading' ? `${video.percentage}%`
                                                : 'En espera'}</span>
                                </div>
                                <progress
                                    aria-label={`Carga del video del módulo ${video.moduleIndex + 1}, clase ${video.classIndex + 1}`}
                                    value={video.percentage}
                                    max={100}
                                    className="mt-1 h-2 w-full"
                                />
                            </li>
                        ))}
                    </ul>
                </section>
            )}
            <fieldset disabled={isSaving} className="min-w-0 w-full border-0 p-0">
            <div>
                <button
                    type="button"
                    className={cn('border border-[#0BBBE7] text-[#0BBBE7] px-1 py-2 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1 mb-4')}
                    onClick={addModule}
                >
                    Agregar módulo <AddCircleOutline />
                </button>

                <TabGroup>
                    <TabList className={cn('flex space-x-1 rounded-md p-4 mb-6  border border-gray-300')}>
                        {modules.map((module, index) => (
                            <Tab
                                key={module.clientKey}
                                className={({ selected }) =>
                                    `w-full py-2.5 text-sm leading-5 font-medium text-[#0BBBE7] rounded-lg focus:outline-none ${selected ? 'bg-[#E8EFF5] shadow' : 'text-[#0BBBE7] hover:bg-white/[0.12]'
                                    }`
                                }
                            >
                                Módulo {index + 1} {moduleHasErrors(index) > 0 ? (<span className={cn('text-red-600')}>(Tiene {moduleHasErrors(index)} errores)</span>) : ''}
                            </Tab>
                        ))}
                    </TabList>
                    <TabPanels>
                        {modules.map((module, moduleIndex) => (
                            <TabPanel key={module.clientKey} className={cn('bg-white p-4 rounded-md border border-gray-300')}>
                                <div className={cn('mb-4')}>
                                    <label className={cn('block text-sm font-medium text-gray-700 mb-2')} htmlFor={`${moduleIndex}-title`}>
                                        Nombre del módulo
                                    </label>
                                    <input
                                        type="text"
                                        id={`${moduleIndex}-title`}
                                        name={`${moduleIndex}-title`}
                                        value={module.title}
                                        onChange={(e) => handleModuleTitleChange(moduleIndex, e.target.value)}
                                        placeholder="[Nombre del módulo]"
                                        className={cn('w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0BBBE7]')}
                                    />
                                    <ErrorMessage
                                        errors={errors}
                                        name={`${moduleIndex}-title`}
                                        render={({ message }) => (
                                            <p className={cn('text-red-500 text-sm text-left w-full')}>
                                                {message}
                                            </p>
                                        )}
                                    />
                                </div>
                                <div className={cn('mb-4')}>
                                    <label className={cn('block text-sm font-medium text-gray-700 mb-2')} htmlFor={`${moduleIndex}-minRequiredPoints`}>
                                        Puntos requeridos
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        id={`${moduleIndex}-minRequiredPoints`}
                                        name={`${moduleIndex}-minRequiredPoints`}
                                        value={module.minRequiredPoints}
                                        onChange={(e) => handleModuleMinRequiredPointsChange(moduleIndex, e.target.value)}
                                        placeholder="[Puntos requeridos]"
                                        className={cn('w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0BBBE7]')}
                                    />
                                    <ErrorMessage
                                        errors={errors}
                                        name={`${moduleIndex}-minRequiredPoints`}
                                        render={({ message }) => (
                                            <p className={cn('text-red-500 text-sm text-left w-full')}>
                                                {message}
                                            </p>
                                        )}
                                    />
                                </div>
                                <button
                                    type="button"
                                    className={cn('border border-red-500 text-red-500 px-1 py-2 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1 mb-4')}
                                    onClick={() => removeModule(moduleIndex)}
                                >
                                    Eliminar módulo<DeleteForever />
                                </button>
                                {module.classes?.map((cls, classIndex) => (
                                    <div key={cls.clientKey} className={cn('border border-gray-300 p-4 rounded-md mb-4')}>
                                        <h3 className={cn('text-lg font-semibold mb-4')}>Clase {classIndex + 1}</h3>
                                        <div className={cn('mb-4')}>
                                            <label className={cn('block text-sm font-medium text-gray-700 mb-2')} htmlFor={`${moduleIndex}-classes-${classIndex}-title`}>
                                                Nombre de la clase
                                            </label>
                                            <input
                                                type="text"
                                                id={`${moduleIndex}-classes-${classIndex}-title`}
                                                name={`${moduleIndex}-classes-${classIndex}-title`}
                                                value={cls.title}
                                                onChange={(e) => handleClassChange(moduleIndex, classIndex, 'title', e.target.value)}
                                                placeholder="[Nombre de la clase]"
                                                className={cn('w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0BBBE7]')}
                                            />
                                            <ErrorMessage
                                                errors={errors}
                                                name={`${moduleIndex}-classes-${classIndex}-title`}
                                                render={({ message }) => (
                                                    <p className={cn('text-red-500 text-sm text-left w-full')}>
                                                        {message}
                                                    </p>
                                                )}
                                            />
                                        </div>

                                        <div className={cn('mb-4')}>
                                            <label className={cn('block text-sm font-medium text-gray-700 mb-2')} htmlFor={`${moduleIndex}-classes-${classIndex}-description`}>
                                                En esta clase aprenderás...
                                            </label>
                                            <textarea
                                                id={`${moduleIndex}-classes-${classIndex}-description`}
                                                name={`${moduleIndex}-classes-${classIndex}-description`}
                                                value={cls.description}
                                                onChange={(e) => handleClassChange(moduleIndex, classIndex, 'description', e.target.value)}
                                                rows={3}
                                                className={cn('w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0BBBE7]')}
                                                placeholder="En esta clase aprenderás a..."
                                            />
                                            <ErrorMessage
                                                errors={errors}
                                                name={`${moduleIndex}-classes-${classIndex}-description`}
                                                render={({ message }) => (
                                                    <p className={cn('text-red-500 text-sm text-left w-full')}>
                                                        {message}
                                                    </p>
                                                )}
                                            />
                                        </div>
                                        {typeof cls.video === 'string' && cls.video !== '' && (
                                            <div className={cn('mb-4')}>
                                                <p className={cn('text-sm text-gray-700')}>
                                                    Video cargado:{" "}
                                                    <a href={typeof cls.video === 'string' ? cls.video : ""} target="_blank" rel="noopener noreferrer" className={cn('text-[#0BBBE7] underline')}>
                                                        Ver video
                                                    </a>
                                                </p>
                                                <p className={cn('text-sm text-gray-500')}>Puedes reemplazar este archivo subiendo uno nuevo.</p>
                                            </div>
                                        )}
                                        <div className={cn('mb-4')}>
                                            <label className={cn('block text-sm font-medium text-gray-700 mb-2')} htmlFor={`${moduleIndex}-classes-${classIndex}-video`}>
                                                Subir video (MP4, 900MB max)
                                            </label>
                                            <div className={cn('border-dashed border-2 border-gray-300 rounded-md p-4')}>
                                                <input
                                                    type="file"
                                                    id={`${moduleIndex}-classes-${classIndex}-video`}
                                                    name={`${moduleIndex}-classes-${classIndex}-video`}
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                            handleClassChange(moduleIndex, classIndex, 'video', e.target.files[0]);
                                                        }
                                                    }}
                                                    className={cn('block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:bg-blue-50 file:text-[#0BBBE7] hover:file:bg-blue-100')}
                                                    accept="video/mp4"
                                                />
                                                <ErrorMessage
                                                    errors={errors}
                                                    name={`${moduleIndex}-classes-${classIndex}-video`}
                                                    render={({ message }) => (
                                                        <p className={cn('text-red-500 text-sm text-left w-full')}>
                                                            {message}
                                                        </p>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            className={cn('border border-red-500 text-red-500 px-1 py-2 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1 mb-4')}
                                            onClick={() => removeClassFromModule(moduleIndex, classIndex)}
                                        >
                                            Eliminar clase <DeleteForever />
                                        </button>
                                    </div>
                                ))}
                                <div className={cn('border border-gray-300 p-4 rounded-md mb-4')}>
                                    <h3 className={cn('text-lg font-semibold mb-4')}>Quiz</h3>
                                    <div className={cn('mb-4')}>
                                        <label className={cn('block text-sm font-medium text-gray-700 mb-2')} htmlFor={`${moduleIndex}-quiz-title`}>
                                            Nombre de evaluación
                                        </label>
                                        <input
                                            type="text"
                                            id={`${moduleIndex}-quiz-title`}
                                            name={`${moduleIndex}-quiz-title`}
                                            value={module.quiz?.title}
                                            onChange={(e) => handleQuizChange(moduleIndex, 'title', e.target.value)}
                                            placeholder="[Nombre de evaluación]"
                                            className={cn('w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0BBBE7]')}
                                        />
                                        <ErrorMessage
                                            errors={errors}
                                            name={`${moduleIndex}-quiz-title`}
                                            render={({ message }) => (
                                                <p className={cn('text-red-500 text-sm text-left w-full')}>
                                                    {message}
                                                </p>
                                            )}
                                        />
                                    </div>
                                    <div className={cn('mb-4')}>
                                        <label className={cn('block text-sm font-medium text-gray-700 mb-2')} htmlFor={`${moduleIndex}-quiz-description`}>
                                            Descripción
                                        </label>
                                        <textarea
                                            id={`${moduleIndex}-quiz-description`}
                                            name={`${moduleIndex}-quiz-description`}
                                            value={module.quiz?.description}
                                            onChange={(e) => handleQuizChange(moduleIndex, 'description', e.target.value)}
                                            rows={3}
                                            className={cn('w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0BBBE7]')}
                                            placeholder="Este primer examen está diseñado para evaluar tu comprensión..."
                                        />
                                        <ErrorMessage
                                            errors={errors}
                                            name={`${moduleIndex}-quiz-description`}
                                            render={({ message }) => (
                                                <p className={cn('text-red-500 text-sm text-left w-full')}>
                                                    {message}
                                                </p>
                                            )}
                                        />
                                    </div>
                                    <TabGroup vertical>
                                        <div className={cn('flex space-x-4')}>
                                            <TabList className={cn('w-1/3 flex flex-col space-y-2 bg-gray-50 rounded-md p-2')}>
                                                {module.quiz?.questions?.map((question, questionIndex) => (
                                                    <div key={question.clientKey} className={cn('flex items-center justify-between')}>
                                                        <Tab
                                                            className={({ selected }) =>
                                                                `w-full max-w-lg py-2 text-sm font-medium rounded-md focus:outline-none ${selected ? 'bg-gray-300 text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                                }`
                                                            }
                                                        >
                                                            Pregunta {questionIndex + 1} {questionHasErrors(questionIndex, moduleIndex) > 0 ? (<span className={cn('text-red-600')}>(Tiene {questionHasErrors(questionIndex, moduleIndex)} errores)</span>) : ''}
                                                        </Tab>
                                                        <button
                                                            type="button"
                                                            className={cn('border-red-500 text-red-500 hover:bg-blue-50 transition-colors flex items-center ')}
                                                            onClick={() => removeQuestionFromQuiz(moduleIndex, questionIndex)}
                                                        >
                                                            <DeleteForever />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    className={cn('border border-[#0BBBE7] text-[#0BBBE7] px-1 py-2 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1')}
                                                    onClick={() => addQuestionToQuiz(moduleIndex)}
                                                >
                                                    Nueva pregunta <AddCircleOutline />
                                                </button>
                                            </TabList>
                                            <TabPanels className={cn('w-2/3')}>
                                                {module.quiz?.questions?.map((question, questionIndex) => (
                                                    <TabPanel key={question.clientKey} className={cn('border border-gray-300 p-4 rounded-md mb-4')}>
                                                        <h4 className={cn('text-md font-semibold mb-4')}>Pregunta {questionIndex + 1}</h4>
                                                        <div className={cn('mb-4')}>
                                                            <label className={cn('block text-sm font-medium text-gray-700 mb-2')} htmlFor={`question-type-${moduleIndex}-${questionIndex}`}>
                                                                Tipo de pregunta
                                                            </label>
                                                            <select
                                                                id={`question-type-${moduleIndex}-${questionIndex}`}
                                                                name={`question-type-${moduleIndex}-${questionIndex}`}
                                                                value={question.type}
                                                                onChange={(e) => {
                                                                    const type = e.target.value;
                                                                    if (type === 'multiple' || type === 'text') {
                                                                        dispatch({ type: 'changeQuestionType', moduleIndex, questionIndex, questionType: type });
                                                                    }
                                                                }}
                                                                className={cn('w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0BBBE7]')}
                                                            >
                                                                <option value="multiple">Selección múltiple</option>
                                                                <option value="text">Input de texto</option>
                                                            </select>
                                                            <ErrorMessage
                                                                errors={errors}
                                                                name={`question-type-${moduleIndex}-${questionIndex}`}
                                                                render={({ message }) => (
                                                                    <p className={cn('text-red-500 text-sm text-left w-full')}>
                                                                        {message}
                                                                    </p>
                                                                )}
                                                            />
                                                        </div>

                                                        <div className={cn('mb-4')}>
                                                            <label className={cn('block text-sm font-medium text-gray-700 mb-2')} htmlFor={`${moduleIndex}-quiz-questions-${questionIndex}-title`}>
                                                                Pregunta
                                                            </label>
                                                            <input
                                                                type="text"
                                                                id={`${moduleIndex}-quiz-questions-${questionIndex}-title`}
                                                                name={`${moduleIndex}-quiz-questions-${questionIndex}-title`}
                                                                value={question.title}
                                                                onChange={(e) => handleQuestionChange(moduleIndex, questionIndex, 'title', e.target.value)}
                                                                placeholder="[Texto de pregunta]"
                                                                className={cn('w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0BBBE7]')}
                                                            />
                                                            <ErrorMessage
                                                                errors={errors}
                                                                name={`${moduleIndex}-quiz-questions-${questionIndex}-title`}
                                                                render={({ message }) => (
                                                                    <p className={cn('text-red-500 text-sm text-left w-full')}>
                                                                        {message}
                                                                    </p>
                                                                )}
                                                            />
                                                        </div>

                                                        <div className={cn('mb-4')}>
                                                            <label className={cn('block text-sm font-medium text-gray-700 mb-2')} htmlFor={`${moduleIndex}-quiz-questions-${questionIndex}-points`}>
                                                                Valor de la pregunta
                                                            </label>
                                                            <input
                                                                type="number"
                                                                id={`${moduleIndex}-quiz-questions-${questionIndex}-points`}
                                                                name={`${moduleIndex}-quiz-questions-${questionIndex}-points`}
                                                                value={question.points}
                                                                onChange={(e) => handleQuestionChange(moduleIndex, questionIndex, 'points', Number(e.target.value))}
                                                                className={cn('w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0BBBE7]')}
                                                                placeholder="[Valor de la pregunta]"
                                                            />
                                                            <ErrorMessage
                                                                errors={errors}
                                                                name={`${moduleIndex}-quiz-questions-${questionIndex}-points`}
                                                                render={({ message }) => (
                                                                    <p className={cn('text-red-500 text-sm text-left w-full')}>
                                                                        {message}
                                                                    </p>
                                                                )}
                                                            />
                                                        </div>
                                                        {question.type === 'text' && (
                                                            <div className={cn('items-center gap-2 mb-2')}>
                                                                <label className={cn('block text-sm font-medium text-gray-700 mb-2')} htmlFor={`${moduleIndex}-quiz-questions-${questionIndex}-expectedAnswer-value`}>
                                                                    Respuesta de la pregunta
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    id={`${moduleIndex}-quiz-questions-${questionIndex}-expectedAnswer-value`}
                                                                    name={`${moduleIndex}-quiz-questions-${questionIndex}-expectedAnswer-value`}
                                                                    value={question.expectedAnswer.value}
                                                                    onChange={(e) => dispatch({ type: 'updateExpectedAnswer', moduleIndex, questionIndex, value: e.target.value })}
                                                                    className={cn('w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0BBBE7]')}
                                                                    placeholder="[Respuesta de la pregunta]"
                                                                />
                                                                <ErrorMessage
                                                                    errors={errors}
                                                                    name={`${moduleIndex}-quiz-questions-${questionIndex}-expectedAnswer-value`}
                                                                    render={({ message }) => (
                                                                        <p className={cn('text-red-500 text-sm text-left w-full')}>
                                                                            {message}
                                                                        </p>
                                                                    )}
                                                                />
                                                            </div>
                                                        )}
                                                        {question.type === 'multiple' && (
                                                            <div>
                                                                {question.options?.map((option, optionIndex) => (
                                                                    <div key={option.clientKey}>
                                                                        <div className={cn('flex items-center gap-2 mb-2')}>
                                                                            <input
                                                                                type="text"
                                                                                value={option.value}
                                                                                id={`${moduleIndex}-quiz-questions-${questionIndex}-options-${optionIndex}-value`}
                                                                                name={`${moduleIndex}-quiz-questions-${questionIndex}-options-${optionIndex}-value`}
                                                                                onChange={(e) => handleOptionChange(moduleIndex, questionIndex, optionIndex, 'value', e.target.value)}
                                                                                placeholder={`Opción ${String.fromCharCode(97 + optionIndex)}`}
                                                                                className={cn('w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0BBBE7]')}
                                                                            />
                                                                            <label className={cn('flex items-center gap-1')}>
                                                                                <input
                                                                                    className={cn('text-blue-600 focus:ring-[#0BBBE7]')}
                                                                                    type="radio"
                                                                                    checked={option.isCorrect}
                                                                                    onChange={(e) => handleOptionChange(moduleIndex, questionIndex, optionIndex, 'isCorrect', e.target.checked)}
                                                                                    name={`correct-answer-${moduleIndex}-${questionIndex}`}
                                                                                />
                                                                                <span className={cn('text-sm text-gray-700')}>Correcta</span>
                                                                            </label>
                                                                            <button
                                                                                type="button"
                                                                                className={cn('text-red-500 hover:underline')}
                                                                                onClick={() => dispatch({ type: 'removeOption', moduleIndex, questionIndex, optionIndex })}
                                                                            >
                                                                                <DeleteForever />
                                                                            </button>
                                                                        </div>
                                                                        <ErrorMessage
                                                                            errors={errors}
                                                                            name={`${moduleIndex}-quiz-questions-${questionIndex}-options-${optionIndex}-value`}
                                                                            render={({ message }) => (
                                                                                <p className={cn('text-red-500 text-sm text-left mb-4')}>
                                                                                    {message}
                                                                                </p>
                                                                            )}
                                                                        />
                                                                    </div>
                                                                ))}
                                                                <ErrorMessage
                                                                    errors={errors}
                                                                    name={`${moduleIndex}-quiz-questions-${questionIndex}-options`}
                                                                    render={({ message }) => (
                                                                        <p className={cn('text-red-500 text-sm text-left mb-4')}>
                                                                            {message}
                                                                        </p>
                                                                    )}
                                                                />
                                                                <ErrorMessage
                                                                    errors={errors}
                                                                    name={`${moduleIndex}-quiz-questions-${questionIndex}`}
                                                                    render={({ message }) => (
                                                                        <p className={cn('text-red-500 text-sm text-left mb-4')}>
                                                                            {message}
                                                                        </p>
                                                                    )}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className={cn('border border-[#0BBBE7] text-[#0BBBE7] px-1 py-2 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1')}
                                                                    onClick={() => addOptionToQuestion(moduleIndex, questionIndex)}
                                                                >
                                                                    Agregar otra opción <AddCircleOutline />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </TabPanel>
                                                ))}
                                                <ErrorMessage
                                                    errors={errors}
                                                    name={`${moduleIndex}-quiz-questions`}
                                                    render={({ message }) => (
                                                        <p className={cn('text-red-500 text-sm text-left w-full')}>
                                                            {message}
                                                        </p>
                                                    )}
                                                />
                                            </TabPanels>

                                        </div>
                                    </TabGroup>
                                </div>

                                <button
                                    type="button"
                                    className={cn('border border-[#0BBBE7] text-[#0BBBE7] px-1 py-2 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1 mb-4')}
                                    onClick={() => addClassToModule(moduleIndex)}
                                >
                                    Agregar otra clase <AddCircleOutline />
                                </button>
                            </TabPanel>
                        ))}
                    </TabPanels>
                </TabGroup>
            </div>
            </fieldset>
            {saveError && <p role="alert" className={cn('mt-4 text-sm text-red-600')}>{saveError}</p>}
            <div className={cn('flex justify-end mt-8')}>
                <div className={cn('flex mx-3')}>
                    <Button
                        type="button"
                        disabled={isSaving}
                        className={cn('border border-[#0BBBE7] text-[#0BBBE7] px-6 py-2 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1')}
                        onClick={onPreviousStep}
                    >
                        Atrás
                    </Button>
                </div>
                <div className={cn('flex mx-3')}>
                    <Button
                        type="button"
                        disabled={isSaving}
                        className={cn('bg-[#0BBBE7] text-white px-6 py-2 rounded-md hover:bg-[#009fdf] transition-colors')}
                        onClick={onNextStep}
                    >
                        {isSaving ? 'Guardando...' : 'Guardar y continuar'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
