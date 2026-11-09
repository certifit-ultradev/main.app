import type { CourseEditorWritePort } from '@/application/courses/course-editor.ports';
import type { CourseBasicsCommand, CourseBasicsPatchCommand, CourseContentCommand, CourseEditorPatch, CreateCourseCommand } from '@/application/courses/course-editor.commands';
import { prisma } from '@/lib/prisma';
import { toSnakeCase } from '@/shared/text/snake-case';
import {
    COURSE_IMAGE_CLEANUP_DELAY_MS,
    isCourseAssetUrlForId,
    isManagedCourseAssetUrl,
    RETRYABLE_COURSE_ASSET_CLEANUP_DELAY_MS,
} from '@/shared/course-assets';
import type { Prisma } from '@/prisma/app/generated/prisma/client';

const invalid = (message: string): never => { throw new Error(message); };

const courseBasicsData = (command: CourseBasicsCommand) => ({
    title: command.title, description: command.description, price: command.price,
    categoryId: command.categoryId, instructorName: command.instructorName,
    courseImage: command.courseImage, instructorPhoto: command.instructorPhoto,
    expiresAt: command.expiresAt,
});

const courseBasicsPatchData = (command: CourseBasicsPatchCommand) => ({
    ...(command.title !== undefined ? { title: command.title } : {}),
    ...(command.description !== undefined ? { description: command.description } : {}),
    ...(command.price !== undefined ? { price: command.price } : {}),
    ...(command.categoryId !== undefined ? { categoryId: command.categoryId } : {}),
    ...(command.instructorName !== undefined ? { instructorName: command.instructorName } : {}),
    ...(command.courseImage !== undefined ? { courseImage: command.courseImage } : {}),
    ...(command.instructorPhoto !== undefined ? { instructorPhoto: command.instructorPhoto } : {}),
    ...(command.expiresAt !== undefined ? { expiresAt: command.expiresAt } : {}),
});

const createDraft: CourseEditorWritePort['createDraft'] = async (command) => {
    const create = {
        ...courseBasicsData(command), canonicalId: toSnakeCase(command.title), isActive: false,
        ...(command.draftKey ? { draftKey: command.draftKey } : {}),
    };
    const course = command.draftKey
        ? await prisma.course.upsert({ where: { draftKey: command.draftKey }, create, update: {} })
        : await prisma.course.create({ data: create });
    return course.id;
};

const enqueueCleanup = async (
    tx: Prisma.TransactionClient,
    courseId: number,
    urls: string[],
) => {
    const uniqueUrls = [...new Set(urls.filter(isManagedCourseAssetUrl))];
    if (uniqueUrls.length > 0) {
        await tx.courseAssetCleanup.createMany({
            data: uniqueUrls.map((url) => ({ url, courseId })), skipDuplicates: true,
        });
    }
};

const updateBasics: CourseEditorWritePort['updateBasics'] = async (courseId, command) => {
    const data = courseBasicsPatchData(command);
    if (Object.keys(data).length === 0) return;
    if (command.courseImage === undefined && command.instructorPhoto === undefined) {
        await prisma.course.update({ where: { id: courseId }, data });
        return;
    }
    await prisma.$transaction(async (tx) => {
        const previous = await tx.course.findUnique({ where: { id: courseId }, select: { courseImage: true, instructorPhoto: true } });
        if (!previous) throw new Error('Curso inválido');
        await tx.course.update({ where: { id: courseId }, data });
        await enqueueCleanup(tx, courseId, [
            command.courseImage !== undefined && previous.courseImage !== command.courseImage ? previous.courseImage : '',
            command.instructorPhoto !== undefined && previous.instructorPhoto !== command.instructorPhoto ? previous.instructorPhoto : '',
        ]);
    }, { isolationLevel: 'Serializable' });
};

const queueUnusedAssets: CourseEditorWritePort['queueUnusedAssets'] = async (courseId, urls) => {
    const managed = [...new Set(urls.filter((url) => isCourseAssetUrlForId(url, courseId)))];
    if (managed.length === 0) return;
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
    if (!course) throw new Error('Curso inválido');
    await prisma.courseAssetCleanup.createMany({
        data: managed.map((url) => ({
            url, courseId,
            availableAt: new Date(Date.now() + (new URL(url).pathname.endsWith('.mp4')
                ? RETRYABLE_COURSE_ASSET_CLEANUP_DELAY_MS : COURSE_IMAGE_CLEANUP_DELAY_MS)),
        })),
        skipDuplicates: true,
    });
};

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

        for (const [modulePosition, module] of command.modules.entries()) {
            const savedModule = await tx.courseModules.create({
                data: { courseId: course.id, position: modulePosition, title: module.title, minRequiredPoints: module.minRequiredPoints },
            });

            if (module.classes.length > 0) {
                await tx.moduleClass.createMany({
                    data: module.classes.map((lesson, position) => ({
                        courseModuleId: savedModule.id,
                        position,
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
    if (!isActive) {
        await prisma.course.update({ where: { id: courseId }, data: { isActive: false } });
        return true;
    }
    return prisma.$transaction(async (tx) => {
        const course = await tx.course.findUnique({
            where: { id: courseId },
            include: { courseModules: { include: {
                moduleClass: true,
                moduleQuiz: { include: { quizQuestion: { include: { possibleAnswerQuestion: { where: { deletedAt: null } } } } } },
            } } },
        });
        if (!course || course.deleted) return false;
        if (course.isActive) return true;

        const ready = course.title.trim() && course.description.trim() && course.instructorName.trim()
            && course.price > 0 && course.expiresAt > new Date() && course.courseModules.length > 0
            && course.courseModules.every((module) => module.title.trim() && module.minRequiredPoints > 0
                && module.moduleClass.length > 0
                && module.moduleClass.every((lesson) => lesson.title.trim() && lesson.description.trim() && lesson.videoPath.trim())
                && module.moduleQuiz.length === 1
                && module.moduleQuiz[0].title.trim() && module.moduleQuiz[0].description.trim()
                && module.moduleQuiz[0].quizQuestion.length > 0
                && module.moduleQuiz[0].quizQuestion.every((question) => question.title.trim() && question.points > 0
                    && (question.type === 'text'
                    ? Boolean(question.expectedAnswer?.trim())
                    : question.type === 'multiple'
                        && question.possibleAnswerQuestion.length >= 2
                        && question.possibleAnswerQuestion.every((answer) => answer.value.trim())
                        && question.possibleAnswerQuestion.filter((answer) => answer.isCorrect).length === 1)));
        if (!ready || await tx.course.count({ where: { isActive: true, deleted: false } }) >= 3) return false;
        await tx.course.update({ where: { id: courseId }, data: { isActive: true } });
        return true;
    }, { isolationLevel: 'Serializable' });
};

const setClassVideo = async (classId: number, videoPath: string, videoSize: number): Promise<boolean> => {
    await prisma.$transaction(async (tx) => {
        const previous = await tx.moduleClass.findUnique({
            where: { id: classId }, select: { videoPath: true, courseModule: { select: { courseId: true } } },
        });
        if (!previous) throw new Error('Clase inválida');
        await tx.moduleClass.update({ where: { id: classId }, data: { videoPath, videoSize } });
        await enqueueCleanup(tx, previous.courseModule.courseId, [previous.videoPath !== videoPath ? previous.videoPath : '']);
    }, { isolationLevel: 'Serializable' });
    return true;
};

/** Reconciles an editor aggregate by stable IDs; its input never contains UI paths or Partial entities. */
const reconcileContent = async (courseId: number, patch: CourseContentCommand, basics?: CourseBasicsCommand): Promise<void> => {
    await prisma.$transaction(async (tx) => {
        const current = await tx.course.findUnique({
            where: { id: courseId },
            select: {
                id: true,
                courseImage: true,
                instructorPhoto: true,
                courseModules: {
                    select: {
                        id: true,
                        moduleClass: { select: { id: true, videoPath: true } },
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

        const cleanupUrls: string[] = [];
        if (basics) {
            await tx.course.update({ where: { id: courseId }, data: courseBasicsData(basics) });
            if (course.courseImage !== basics.courseImage) cleanupUrls.push(course.courseImage);
            if (course.instructorPhoto !== basics.instructorPhoto) cleanupUrls.push(course.instructorPhoto);
        }

        const requestedModuleIds = new Set(patch.modules.flatMap((module) => module.id === undefined ? [] : [module.id]));
        for (const module of course.courseModules.filter((item) => !requestedModuleIds.has(item.id))) {
            cleanupUrls.push(...module.moduleClass.map((lesson) => lesson.videoPath));
            await tx.courseModules.delete({ where: { id: module.id } });
        }

        for (const [modulePosition, module] of patch.modules.entries()) {
            if (module.id === undefined) {
                // A draft has no persisted content yet. One nested write avoids a
                // separate Accelerate round trip for every class, question and answer.
                await tx.courseModules.create({ data: {
                    courseId, position: modulePosition, title: module.title, minRequiredPoints: module.minRequiredPoints,
                    moduleClass: { create: module.classes.map((lesson, position) => ({
                        position, title: lesson.title, description: lesson.description,
                        videoPath: lesson.videoPath, videoSize: lesson.videoSize, videoDuration: lesson.videoDuration,
                    })) },
                    moduleQuiz: { create: {
                        title: module.quiz.title, description: module.quiz.description,
                        quizQuestion: { create: module.quiz.questions.map((question) => ({
                            title: question.title, type: question.type, points: question.points,
                            expectedAnswer: question.type === 'text' ? question.expectedAnswer.value : null,
                            ...(question.type === 'multiple' ? { possibleAnswerQuestion: { create: question.options.map((option) => ({
                                value: option.value, isCorrect: option.isCorrect,
                            })) } } : {}),
                        })) },
                    } },
                } });
                continue;
            }
            const savedModule = await tx.courseModules.update({
                where: { id: module.id },
                data: { position: modulePosition, title: module.title, minRequiredPoints: module.minRequiredPoints },
            });
            const existing = modulesById.get(savedModule.id);
            const requestedClassIds = new Set(module.classes.flatMap((lesson) => lesson.id === undefined ? [] : [lesson.id]));
            for (const lesson of existing?.moduleClass ?? []) if (!requestedClassIds.has(lesson.id)) {
                cleanupUrls.push(lesson.videoPath);
                await tx.moduleClass.delete({ where: { id: lesson.id } });
            }
            for (const [position, lesson] of module.classes.entries()) {
                const previous = existing?.moduleClass.find((item) => item.id === lesson.id);
                if (previous && previous.videoPath !== lesson.videoPath) cleanupUrls.push(previous.videoPath);
                const data = { position, title: lesson.title, description: lesson.description, videoPath: lesson.videoPath, videoSize: lesson.videoSize, videoDuration: lesson.videoDuration };
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
        await enqueueCleanup(tx, courseId, cleanupUrls);
        const retainedUrls = [...new Set(patch.modules.flatMap((module) =>
            module.classes.map((lesson) => lesson.videoPath).filter(isManagedCourseAssetUrl),
        ))];
        if (retainedUrls.length > 0) await tx.courseAssetCleanup.deleteMany({
            where: { courseId, url: { in: retainedUrls } },
        });
    }, { isolationLevel: 'Serializable', timeout: 12_000 });
};

const saveContent: CourseEditorWritePort['saveContent'] = async (courseId, command) => reconcileContent(courseId, command);
const updateCourse = async (courseId: number, patch: CourseEditorPatch): Promise<void> => reconcileContent(courseId, patch, patch);

export const prismaCourseEditorWritePort: CourseEditorWritePort = {
    createDraft,
    updateBasics,
    saveContent,
    queueUnusedAssets,
    createCourse,
    setCourseActive,
    setClassVideo,
    updateCourse,
};
