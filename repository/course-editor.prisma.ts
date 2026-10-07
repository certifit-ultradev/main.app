import type { CourseEditorWritePort } from '@/application/courses/course-editor.ports';
import type { CourseEditorPatch, CreateCourseCommand } from '@/application/courses/course-editor.commands';
import { prisma } from '@/lib/prisma';
import { toSnakeCase } from '@/shared/text/snake-case';

const invalid = (message: string): never => { throw new Error(message); };

/** Creates the editor aggregate from durable asset URLs; Blob and UI Files never reach this adapter. */
const createCourse = async (command: CreateCourseCommand): Promise<number> => {
    return prisma.$transaction(async (tx) => {
        const course = await tx.course.create({
            data: {
                canonicalId: toSnakeCase(command.title),
                title: command.title,
                description: command.description,
                price: command.price,
                courseImage: command.courseImage,
                categoryId: command.categoryId,
                instructorName: command.instructorName,
                instructorPhoto: command.instructorPhoto,
                expiresAt: command.expiresAt,
                isActive: false,
            },
        });

        for (const module of command.modules) {
            const savedModule = await tx.courseModules.create({
                data: { courseId: course.id, title: module.title, minRequiredPoints: module.minRequiredPoints },
            });

            if (module.classes.length > 0) {
                await tx.moduleClass.createMany({
                    data: module.classes.map((lesson) => ({
                        courseModuleId: savedModule.id,
                        title: lesson.title,
                        description: lesson.description,
                        videoPath: lesson.videoPath,
                        videoSize: lesson.videoSize,
                        videoDuration: lesson.videoDuration,
                    })),
                });
            }

            const savedQuiz = await tx.moduleQuiz.create({
                data: { courseModuleId: savedModule.id, title: module.quiz.title, description: module.quiz.description },
            });
            for (const question of module.quiz.questions) {
                const savedQuestion = await tx.quizQuestion.create({
                    data: {
                        quizId: savedQuiz.id, title: question.title, type: question.type, points: question.points,
                        expectedAnswer: question.type === 'text' ? question.expectedAnswer : null,
                    },
                });
                if (question.type === 'multiple') await tx.possibleAnswerQuestion.createMany({
                    data: question.options.map((option) => ({
                        questionId: savedQuestion.id,
                        value: option.value,
                        isCorrect: option.isCorrect,
                    })),
                });
            }
        }

        return course.id;
    });
};

const setCourseActive = async (courseId: number, isActive: boolean): Promise<boolean> => {
    await prisma.course.update({ where: { id: courseId }, data: { isActive } });
    return true;
};

const setClassVideo = async (classId: number, videoPath: string, videoSize: number): Promise<boolean> => {
    await prisma.moduleClass.update({ where: { id: classId }, data: { videoPath, videoSize } });
    return true;
};

/** Reconciles an editor aggregate by stable IDs; its input never contains UI paths or Partial entities. */
const updateCourse = async (courseId: number, patch: CourseEditorPatch): Promise<void> => {
    await prisma.$transaction(async (tx) => {
        const current = await tx.course.findUnique({
            where: { id: courseId },
            select: {
                id: true,
                courseModules: {
                    select: {
                        id: true,
                        moduleClass: { select: { id: true } },
                        moduleQuiz: {
                            select: {
                                id: true,
                                quizQuestion: {
                                    select: {
                                        id: true,
                                        type: true,
                                        possibleAnswerQuestion: { where: { deletedAt: null }, select: { id: true } },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!current) throw new Error('Curso inválido');
        const course = current;

        const modulesById = new Map(course.courseModules.map((module) => [module.id, module]));
        for (const module of patch.modules) {
            if (module.id !== undefined && !modulesById.has(module.id)) invalid('Módulo inválido para el curso');
            const existingModule = module.id === undefined ? undefined : modulesById.get(module.id);
            if (!existingModule) {
                if (module.quiz.id !== undefined
                    || module.classes.some((lesson) => lesson.id !== undefined)
                    || module.quiz.questions.some((question) => question.id !== undefined
                        || (question.type === 'multiple' && question.options.some((option) => option.id !== undefined)))) {
                    invalid('Los elementos nuevos no pueden reutilizar IDs persistidos');
                }
                continue;
            }
            const classes = new Set(existingModule.moduleClass.map((item) => item.id));
            const quiz = existingModule.moduleQuiz[0];
            if (module.quiz.id !== undefined && module.quiz.id !== quiz?.id) invalid('Quiz inválido para el módulo');
            const questions = new Map((quiz?.quizQuestion ?? []).map((item) => [item.id, item]));
            for (const lesson of module.classes) if (lesson.id !== undefined && !classes.has(lesson.id)) invalid('Clase inválida para el módulo');
            for (const question of module.quiz.questions) {
                if (question.id !== undefined && !questions.has(question.id)) invalid('Pregunta inválida para el quiz');
                const existingQuestion = question.id === undefined ? undefined : questions.get(question.id);
                const options = new Set(existingQuestion?.possibleAnswerQuestion.map((item) => item.id));
                if (question.type === 'multiple') {
                    const optionIds = question.options.flatMap((option) => option.id === undefined ? [] : [option.id]);
                    if (new Set(optionIds).size !== optionIds.length) invalid('Opción duplicada para la pregunta');
                    for (const option of question.options) {
                        if (option.id !== undefined && (existingQuestion?.type !== 'multiple' || !options.has(option.id))) {
                            invalid('Opción inválida para la pregunta');
                        }
                    }
                }
            }
        }

        await tx.course.update({ where: { id: courseId }, data: {
            title: patch.title, description: patch.description, price: patch.price, categoryId: patch.categoryId,
            instructorName: patch.instructorName, courseImage: patch.courseImage, instructorPhoto: patch.instructorPhoto,
            expiresAt: patch.expiresAt,
        } });

        const requestedModuleIds = new Set(patch.modules.flatMap((module) => module.id === undefined ? [] : [module.id]));
        for (const module of course.courseModules.filter((item) => !requestedModuleIds.has(item.id))) {
            await tx.courseModules.delete({ where: { id: module.id } });
        }

        for (const module of patch.modules) {
            const savedModule = module.id === undefined
                ? await tx.courseModules.create({ data: { courseId, title: module.title, minRequiredPoints: module.minRequiredPoints } })
                : await tx.courseModules.update({ where: { id: module.id }, data: { title: module.title, minRequiredPoints: module.minRequiredPoints } });
            const existing = modulesById.get(savedModule.id);
            const requestedClassIds = new Set(module.classes.flatMap((lesson) => lesson.id === undefined ? [] : [lesson.id]));
            for (const lesson of existing?.moduleClass ?? []) if (!requestedClassIds.has(lesson.id)) await tx.moduleClass.delete({ where: { id: lesson.id } });
            for (const lesson of module.classes) {
                const data = { title: lesson.title, description: lesson.description, videoPath: lesson.videoPath, videoSize: lesson.videoSize, videoDuration: lesson.videoDuration };
                if (lesson.id === undefined) await tx.moduleClass.create({ data: { ...data, courseModuleId: savedModule.id } });
                else await tx.moduleClass.update({ where: { id: lesson.id }, data });
            }

            const existingQuiz = existing?.moduleQuiz[0];
            const savedQuiz = existingQuiz === undefined
                ? await tx.moduleQuiz.create({ data: { courseModuleId: savedModule.id, title: module.quiz.title, description: module.quiz.description } })
                : await tx.moduleQuiz.update({ where: { id: existingQuiz.id }, data: { title: module.quiz.title, description: module.quiz.description } });
            const existingQuestions = new Map((existingQuiz?.quizQuestion ?? []).map((question) => [question.id, question]));
            const requestedQuestionIds = new Set(module.quiz.questions.flatMap((question) => question.id === undefined ? [] : [question.id]));
            for (const question of existingQuestions.values()) if (!requestedQuestionIds.has(question.id)) await tx.quizQuestion.delete({ where: { id: question.id } });
            for (const question of module.quiz.questions) {
                const data = {
                    title: question.title, type: question.type, points: question.points,
                    expectedAnswer: question.type === 'text' ? question.expectedAnswer.value : null,
                };
                const savedQuestion = question.id === undefined
                    ? await tx.quizQuestion.create({ data: { ...data, quizId: savedQuiz.id } })
                    : await tx.quizQuestion.update({ where: { id: question.id }, data });
                const existingOptions = new Map((existingQuestions.get(savedQuestion.id)?.possibleAnswerQuestion ?? []).map((option) => [option.id, option]));
                const retainedOptionIds = new Set(
                    question.type === 'multiple' && existingQuestions.get(savedQuestion.id)?.type === 'multiple'
                        ? question.options.flatMap((option) => option.id === undefined ? [] : [option.id])
                        : [],
                );
                const removedOptionIds = [...existingOptions.keys()].filter((id) => !retainedOptionIds.has(id));
                if (removedOptionIds.length > 0) await tx.possibleAnswerQuestion.updateMany({
                    where: { id: { in: removedOptionIds }, questionId: savedQuestion.id, deletedAt: null },
                    data: { deletedAt: new Date() },
                });
                if (question.type === 'text') continue;
                for (const option of question.options) {
                    const optionData = { value: option.value, isCorrect: option.isCorrect };
                    if (option.id === undefined) await tx.possibleAnswerQuestion.create({ data: { ...optionData, questionId: savedQuestion.id } });
                    else await tx.possibleAnswerQuestion.update({ where: { id: option.id }, data: optionData });
                }
            }
        }
    });
};

export const prismaCourseEditorWritePort: CourseEditorWritePort = {
    createCourse,
    setCourseActive,
    setClassVideo,
    updateCourse,
};
