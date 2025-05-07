import { NotFoundError } from "@/exceptions/not-found";
import { prisma } from "@/lib/prisma";
import { Course } from "@/models/course";
import { CourseModules } from "@/models/course-modules";
import { ModuleClass } from "@/models/module-class";
import { ModuleQuiz } from "@/models/module-quiz";
import { PossibleAnswerQuestion } from "@/models/possible-answer-question";
import { QuizQuestion } from "@/models/quiz-question";
import { UserClassesState } from "@/models/user-classes-state";
import { UserCourse } from "@/models/user-course";
import { UserQuizAnswer } from "@/models/user-quiz-answer";
import { UserQuizState } from "@/models/user-quiz-state";
import { UserModuleState } from "@/models/user_module_state";
import { storeVideoBlobStorage } from "@/services/video";
import { CourseChange } from "@/utils/change-types";
import { mergeChangesByTypeAndId, toSnakeCase } from "@/utils/classes";
import { Change } from "@/utils/diff";
import { isCourseModule, isModuleClass, isOption, isQuestion } from "@/utils/type-guards";
import { CourseData, CoursesMonthResult, ResultSalesCourse, UsersMonthResult } from "@/utils/types";
import { Prisma, PrismaClient } from "@prisma/client";

export const allCourses = async (page: number, pageSize: number): Promise<Course[]> => {
    if (page < 1) {
        page = 1;
    }
    const courses = await prisma.course.findMany({
        include: { category: true },
        where: { deleted: false },
        orderBy: [
            {
                createdAt: 'desc'
            }
        ],
        skip: (page - 1) * pageSize,
        take: pageSize
    });

    if (courses.length == 0) {
        return [];
    }

    return courses.map<Course>((course) => {
        return new Course({ ...course })
    })
}

export const countAllCourses = async (): Promise<number> => {
    return await prisma.course.count();
}

export const countAllActiveCourses = async (): Promise<number> => {
    return await prisma.course.count({
        where: {
            isActive: true
        }
    });
}

export const findThreeCoursesActives = async (userId?: string): Promise<Course[]> => {
    let query = {
        include: {
            category: true,
            courseModules: {
                include: {
                    moduleClass: true
                }
            },
            userCourse: {
                where: {
                    userId,
                },
            },
        },
        where: {
            isActive: true
        }
    };

    if (!userId) {
        delete (query.include as any).userCourse;
    }

    console.dir(query, { depth: null });

    const activeCourses = await prisma.course.findMany(query);
    if (activeCourses.length == 0) {
        return [];
    }

    return activeCourses.map<Course>((course) => {
        return new Course({ ...course })
    });
}

export const findUserCourses = async (userId?: string): Promise<UserCourse[]> => {
    const userCourses = await prisma.userCourse.findMany({
        where: {
            userId: userId,
        },
        orderBy: [
            {
                createdAt: 'desc'
            }
        ],
        include: {
            course: {
                include: {
                    category: true,
                    courseModules: {
                        include: {
                            moduleClass: true,
                            moduleQuiz: true
                        }
                    }
                }
            },
            userClassesState: true,
            userModuleState: true,
        },
    });
    if (userCourses.length == 0) {
        return [];
    }

    return userCourses.map<UserCourse>((userCourse) => {
        return new UserCourse({
            id: userCourse.id,
            userId: userCourse.userId,
            courseId: userCourse.courseId,
            completedAt: userCourse.completedAt,
            createdAt: userCourse.createdAt,
            updatedAt: userCourse.updatedAt,
            course: new Course({ ...userCourse.course }),
            userClassesState: userCourse.userClassesState,
            userModuleState: userCourse.userModuleState
        })
    });
}

export const findModulesByCourseId = async (courseId: number): Promise<CourseModules[]> => {
    const modules = await prisma.courseModules.findMany({
        where: { deleted: false, courseId }
    });

    if (modules.length == 0) {
        return [];
    }

    return modules.map<CourseModules>((modules) => {
        return new CourseModules({ ...modules })
    })
}

export const findCourseById = async (id: number): Promise<Course> => {
    const course = await prisma.course.findFirst({
        include: {
            category: true,
            courseModules: {
                include: {
                    moduleClass: true,
                    moduleQuiz: {
                        include: {
                            quizQuestion: {
                                include: {
                                    possibleAnswerQuestion: true
                                }
                            }
                        }
                    }
                }
            }
        },
        where: { id }
    });

    if (!course) {
        throw new NotFoundError('Curso no encontrado');
    }

    return new Course({
        ...course
    });
}

export const findCourseWithModulesByCanonicalId = async (id: string, userId: string): Promise<Course> => {
    const course = await prisma.course.findFirst({
        include: {
            category: true,
            courseModules: {
                include: {
                    moduleClass: true,
                    moduleQuiz: {
                        include: {
                            quizQuestion: {
                                include: {
                                    possibleAnswerQuestion: true
                                }
                            }
                        }
                    }
                }
            },
        },
        where: { canonicalId: id }
    });

    if (!course) {
        throw new NotFoundError('Curso no encontrado');
    }

    return new Course({
        ...course
    });
}

export const findCourseByCanonicalId = async (id: string, userId: string): Promise<Course> => {
    const course = await prisma.course.findFirst({
        where: { canonicalId: id }
    });

    if (!course) {
        throw new NotFoundError('Curso no encontrado');
    }

    return new Course({
        ...course
    });
}

export const findUserCourseByCanonicalId = async (id: string, userId: string): Promise<Course> => {
    const course = await prisma.course.findFirst({
        include: {
            userCourse: {
                where: {
                    userId,
                },
                include: {
                    userClassesState: true,
                    userModuleState: true,
                }
            }
        },
        where: {
            canonicalId: id,
            userCourse: {
                every: {
                    userId
                }
            }
        }
    });

    if (!course) {
        throw new NotFoundError('Curso no encontrado');
    }

    return new Course({
        ...course
    });
}

export const findUserCourseWithModulesByCanonicalId = async (id: string, userId: string): Promise<Course> => {
    const course = await prisma.course.findFirst({
        include: {
            category: true,
            courseModules: {
                include: {
                    moduleClass: true,
                    moduleQuiz: {
                        include: {
                            quizQuestion: {
                                include: {
                                    possibleAnswerQuestion: true
                                }
                            }
                        }
                    }
                }
            },
            userCourse: {
                where: {
                    userId,
                },
                include: {
                    userClassesState: true,
                    userModuleState: true,
                    userQuizState: {
                        orderBy: [
                            {
                                id: 'desc',
                            }
                        ]
                    }
                }
            }
        },
        where: { canonicalId: id }
    });

    if (!course) {
        throw new NotFoundError('Curso no encontrado');
    }

    return new Course({
        ...course
    });
}

export const findQuizAnswersByQuizId = async (userCourseId: number, quizId: number): Promise<UserQuizAnswer[]> => {
    const answers = await prisma.userQuizAnswer.findMany({
        where: {
            userCourseId: userCourseId,
            quizId: quizId,
        },
    });

    if (answers.length == 0) {
        return [];
    }

    return answers.map<UserQuizAnswer>((answer) => {
        return {
            userCourseId: answer.userCourseId,
            quizId: answer.quizId,
            questionId: answer.questionId,
            correct: answer.correct,
            answer: answer.answer,
            isCorrect: answer.isCorrect,
            points: answer.points,
            createdAt: answer.createdAt,
            updatedAt: answer.updatedAt
        }
    })
}

export const createFullCourse = async (course: CourseData): Promise<Course> => {
    const txCourse = await prisma.$transaction(async (tx) => {
        const createdCourse = await tx.course.create({
            data: {
                canonicalId: toSnakeCase(course.title),
                title: course.title,
                description: course.description,
                price: Number(course.price),
                courseImage: "",
                categoryId: course.category?.id || 0,
                instructorName: course.instructorName,
                instructorPhoto: "",
                expiresAt: new Date(course.expiresAt),
                isActive: false,
            }
        });

        const modulesData = course.modules?.map((m) => ({
            courseId: createdCourse.id,
            title: m.title,
            minRequiredPoints: m.minRequiredPoints
        })) ?? [];

        const createdModules = await Promise.all(
            modulesData.map(m => tx.courseModules.create({ data: m }))
        );

        for (let i = 0; i < createdModules.length; i++) {
            const moduleCreated = createdModules[i];
            const originalModule = course.modules![i];

            if (originalModule.classes && originalModule.classes.length > 0) {
                const classesData = originalModule.classes.map(cls => ({
                    title: cls.title,
                    description: cls.description,
                    courseModuleId: moduleCreated.id,
                    videoPath: "",
                    videoSize: cls.videoSize,
                    videoDuration: cls.videoDuration,
                }));

                await tx.moduleClass.createMany({ data: classesData });
            }

            if (originalModule.quiz && originalModule.quiz.questions && originalModule.quiz.questions.length > 0) {
                const createdQuiz = await tx.moduleQuiz.create({
                    data: {
                        courseModuleId: moduleCreated.id,
                        title: originalModule.quiz.title,
                        description: originalModule.quiz.description
                    }
                });

                for (const q of originalModule.quiz.questions) {
                    const question = await tx.quizQuestion.create({
                        data: {
                            quizId: createdQuiz.id,
                            title: q.title,
                            type: q.type,
                            points: q.points
                        }
                    });

                    if (q.options && q.options.length > 0) {
                        const optionsData = q.options.map(opt => ({
                            questionId: question.id,
                            value: opt.value,
                            isCorrect: opt.isCorrect
                        }));

                        await tx.possibleAnswerQuestion.createMany({
                            data: optionsData
                        });
                    }
                }
            }
        }

        return createdCourse;
    });

    /**
     * ,
        {
            maxWait: 6000,
            timeout: 20000,
        }
     */

    if (!txCourse) {
        throw new Error("No se pudo crear el curso");
    }

    const courseImageUrl = await storeVideoBlobStorage(`/courses/${txCourse.id}/`, course.courseImage as File);
    const instructorPhotoImageUrl = await storeVideoBlobStorage(`/courses/${txCourse.id}/`, course.instructorPhoto as File);

    await prisma.course.update({
        where: { id: txCourse.id },
        data: {
            courseImage: courseImageUrl,
            instructorPhoto: instructorPhotoImageUrl
        },
    });

    return new Course({
        ...await findCourseById(txCourse.id)
    });
}

export const createUserQuizState = async (userQuizState: UserQuizState): Promise<UserQuizState | null> => {
    const createdUserQuizState = await prisma.userQuizState.create({
        data: {
            quizId: userQuizState.quizId,
            userCourseId: userQuizState.userCourseId,
            courseModuleId: userQuizState.courseModuleId,
            retries: userQuizState.retries,
            result: userQuizState.result,
            passed: userQuizState.passed
        }
    });
    if (!createdUserQuizState) {
        return null;
    }
    return new UserQuizState({
        ...createdUserQuizState
    });
}

export const findUserQuizState = async (quizId: number, userCourseId: number) => {
    const state = await prisma.userQuizState.findFirst({
        where: {
            userCourseId: userCourseId,
            quizId: quizId,
        },
        orderBy: [
            {
                id: 'desc',
            }
        ],
    });

    if (!state) {
        throw new NotFoundError('Estado no encontrado');
    }

    return new UserQuizState({
        ...state
    });
}

export const countCourseSales = async (): Promise<ResultSalesCourse[]> => {
    const results = await prisma.$queryRaw<ResultSalesCourse[]>`
        SELECT CONCAT(c.id, ' - ', c.title) AS course_name,
            COUNT(p.id) AS total
        FROM "Purchase" p
        INNER JOIN "Cart" cart ON cart.id = p.cart_id
        INNER JOIN "Course" c ON c.id = cart.course_id
        GROUP BY c.id
    `;

    return results.map<ResultSalesCourse>((r) => {
        return {
            course_name: r.course_name.substring(0, 20) + '...',
            total: Number(r.total)
        }
    });
}

export const sumCourseSalesByLastMonth = async (): Promise<CoursesMonthResult> => {
    const [result] = await prisma.$queryRaw<CoursesMonthResult[]>(Prisma.sql`
        SELECT
            COUNT(*) FILTER (
                WHERE date_trunc('month', p.created_at) = date_trunc('month', CURRENT_DATE)
            ) AS current_month_count,
            COUNT(*) FILTER (
                WHERE date_trunc('month', p.created_at) = date_trunc('month', CURRENT_DATE - interval '1 month')
            ) AS previous_month_count
        FROM "Purchase" p
        WHERE
            p.status = 'APPROVED';`);

    console.log("result sumCourseSalesByLastMonth", result);

    return {
        current_month_count: Number(result.current_month_count),
        previous_month_count: Number(result.previous_month_count),
    };;
}

export const sumUsersByLastMonth = async (): Promise<UsersMonthResult> => {
    const [result] = await prisma.$queryRaw<UsersMonthResult[]>`
        SELECT
            COUNT(*) FILTER (
                WHERE date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)
            ) AS currentMonthCount,
            COUNT(*) FILTER (
                WHERE date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE - interval '1 month')
            ) AS previousMonthCount
        FROM "User";
      `;

    console.log("result sumUsersByLastMonth", result);
    return {
        current_month_count: Number(result.current_month_count),
        previous_month_count: Number(result.previous_month_count),
    };
}

const modelMap: Record<string, keyof PrismaClient> = {
    course: 'course',
    module: 'courseModules',
    class: 'moduleClass',
    quiz: 'moduleQuiz',
    question: 'quizQuestion',
    option: 'possibleAnswerQuestion'
};

export const updateFullCourse = async (
    courseId: number,
    adds: CourseChange[],
    updates: CourseChange[],
    deletes: CourseChange[]
) => {
    let courseImage: File | undefined;
    let instructorPhoto: File | undefined;

    await prisma.$transaction(async (tx) => {
        for (const add of adds) {
            switch (add.type) {
                case 'question':
                    if (!isQuestion(add.data))
                        throw new Error("Datos de pregunta incompletos");

                    const createdQuizQuestion = await tx.quizQuestion.create({
                        data: {
                            title: add.data.title,
                            quizId: Number(add.path.quiz),
                            type: add.data.type,
                            points: Number(add.data.points)
                        }
                    });
                    if (!createdQuizQuestion) {
                        throw new Error("La pregunta no pudo ser creada");
                    }

                    for (const option of add.data.options ?? []) {
                        if (!isOption(add.data))
                            throw new Error("Datos de opción incompletos");

                        const createdQuestionOption = await tx.possibleAnswerQuestion.create({
                            data: {
                                questionId: createdQuizQuestion.id,
                                value: option.value,
                                isCorrect: option.isCorrect
                            }
                        });
                        if (!createdQuestionOption) {
                            throw new Error("La opción no pudo ser creada");
                        }
                    }
                    break;
                case 'option':
                    if (!isOption(add.data))
                        throw new Error("Datos de opción incompletos");
                    const createdQuestionOption = await tx.possibleAnswerQuestion.create({
                        data: {
                            questionId: Number(add.path.question),
                            value: add.data.value,
                            isCorrect: add.data.isCorrect
                        }
                    });
                    if (!createdQuestionOption) {
                        throw new Error("La opción no pudo ser creada");
                    }
                    break;
                case 'class':
                    if (!isModuleClass(add.data))
                        throw new Error("Datos de clase incompletos");
                    const createdModuleClass = await tx.moduleClass.create({
                        data: {
                            title: add.data.title,
                            description: add.data.description,
                            courseModuleId: Number(add.path.module),
                            videoPath: add.data.video as string,
                            videoDuration: add.data.videoDuration,
                            videoSize: add.data.videoSize 
                        }
                    });
                    if (!createdModuleClass) {
                        throw new Error("La clase no pudo ser creada");
                    }
                    break;
                case 'module':
                    if (!isCourseModule(add.data))
                        throw new Error("Datos de módulo incompletos");

                    const createdCourseModule = await tx.courseModules.create({
                        data: {
                            courseId: Number(add.path.course),
                            title: add.data.title,
                            minRequiredPoints: add.data.minRequiredPoints
                        }
                    });
                    if (!createdCourseModule) {
                        throw new Error("El modulo no pudo ser creado");
                    }

                    for (const cls of add.data.classes ?? []) {
                        const createdModuleClass = await tx.moduleClass.create({
                            data: {
                                title: cls.title,
                                description: cls.description,
                                courseModuleId: createdCourseModule.id,
                                videoPath: cls.video as string,
                                videoDuration: cls.videoDuration,
                                videoSize: cls.videoSize
                            }
                        });
                        if (!createdModuleClass) {
                            throw new Error("La clase no pudo ser creada");
                        }
                    }

                    const createdQuiz = await tx.moduleQuiz.create({
                        data: {
                            courseModuleId: createdCourseModule.id,
                            title: add.data.quiz?.title as string,
                            description: add.data.quiz?.description as string
                        }
                    });

                    for (const question of add.data.quiz?.questions ?? []) {
                        const createdQuizQuestion = await tx.quizQuestion.create({
                            data: {
                                title: question.title,
                                quizId: createdQuiz.id,
                                type: question.type,
                                points: Number(question.points)
                            }
                        });
                        if (!createdQuizQuestion) {
                            throw new Error("La pregunta no pudo ser creada");
                        }

                        for (const option of question.options ?? []) {
                            const createdQuestionOption = await tx.possibleAnswerQuestion.create({
                                data: {
                                    questionId: createdQuizQuestion.id,
                                    value: option.value,
                                    isCorrect: option.isCorrect
                                }
                            });
                            if (!createdQuestionOption) {
                                throw new Error("La opción no pudo ser creada");
                            }
                        }
                    }
                    break;
            }
        }

        const updatesGrouped = mergeChangesByTypeAndId(updates);
        console.log("updatesGrouped", updatesGrouped);
        for (const type of Object.keys(updatesGrouped)) {
            // Resolvemos el nombre del modelo en Prisma
            const prismaModelName = modelMap[type];
            if (!prismaModelName) {
                console.warn(`No Prisma model mapped for type: ${type}. Skipping.`);
                continue;
            }

            // Accedemos al "subobjeto" para este type, ej. grouped.course => { '29': {...}, '30': {...} }
            const entriesById = updatesGrouped[type];

            for (const idString of Object.keys(entriesById)) {
                const id = parseInt(idString, 10);
                const data = entriesById[idString]; // La data con las propiedades que vas a actualizar

                if (data.courseImage) {
                    courseImage = data.courseImage;
                    delete data.courseImage;
                }

                if (data.instructorPhoto) {
                    instructorPhoto = data.instructorPhoto;
                    delete data.instructorPhoto;
                }

                if (data.expiresAt) {
                    data.expiresAt = new Date(data.expiresAt);
                }

                if (data.price) {
                    data.price = Number(data.price);
                }

                if (data.video) {
                    data.videoPath = data.video;
                    delete data.video;
                }

                try {
                    const txModel = (tx as any)[prismaModelName];
                    await txModel.update({
                        where: { id },
                        data,
                    });
                } catch (error) {
                    console.log(`Error updating ${type} (id=${id}):`);
                    throw error;
                }
            }
        }


        for (const dlt of deletes) {
            switch (dlt.type) {
                case 'course':
                    await tx.course.delete({
                        where: { id: Number(dlt.path.course) },
                    });
                    break;
                case 'module':
                    await tx.courseModules.delete({
                        where: { id: Number(dlt.path.module) },
                    });
                    break;
                case 'class':
                    await tx.moduleClass.delete({
                        where: { id: Number(dlt.path.class) },
                    });
                    break;
                case 'quiz':
                    await tx.moduleQuiz.delete({
                        where: { id: Number(dlt.path.quiz) },
                    });
                    break;
                case 'question':
                    await tx.quizQuestion.delete({
                        where: { id: Number(dlt.path.question) },
                    });
                    break;
                case 'option':
                    await tx.possibleAnswerQuestion.delete({
                        where: { id: Number(dlt.path.option) },
                    });
                    break;
                default:
                    throw new Error(`Tipo desconocido para eliminar: ${dlt}`);
            }
        }
    });

    if (courseImage) {
        const url = await storeVideoBlobStorage(`/courses/${courseId}/`, courseImage);
        await updateCourse(courseId, {
            courseImage: url,
        });
    }

    if (instructorPhoto) {
        const url = await storeVideoBlobStorage(`/courses/${courseId}/`, instructorPhoto);
        await updateCourse(courseId, {
            instructorPhoto: url
        });
    }
}

export const createCourseModule = async (module: CourseModules): Promise<CourseModules | null> => {
    const createdCourseModule = await prisma.courseModules.create({
        data: {
            courseId: module.courseId,
            title: module.title,
            minRequiredPoints: module.minRequiredPoints
        }
    });
    if (!createdCourseModule) {
        return null;
    }
    return new CourseModules({
        ...createdCourseModule
    });
}

export const createModuleClass = async (cls: ModuleClass): Promise<ModuleClass | null> => {
    const createdModuleClass = await prisma.moduleClass.create({
        data: cls
    });
    if (!createdModuleClass) {
        return null;
    }
    return new ModuleClass({ ...createdModuleClass });
}

export const createModuleQuiz = async (quiz: ModuleQuiz): Promise<ModuleQuiz | null> => {
    const createdModuleQuiz = await prisma.moduleQuiz.create({
        data: {
            title: quiz.title,
            description: quiz.description,
            courseModuleId: quiz.courseModuleId
        }
    });
    if (!createdModuleQuiz) {
        return null;
    }
    return new ModuleQuiz({
        ...createdModuleQuiz
    });
}

export const createQuizQuestion = async (question: QuizQuestion): Promise<QuizQuestion | null> => {
    const createdQuizQuestion = await prisma.quizQuestion.create({
        data: {
            quizId: question.quizId,
            title: question.title,
            type: question.type,
            points: question.points
        }
    });
    if (!createdQuizQuestion) {
        return null;
    }
    return new QuizQuestion({
        ...createdQuizQuestion
    });
}

export const createQuestionOption = async (option: PossibleAnswerQuestion): Promise<PossibleAnswerQuestion | null> => {
    const createdQuestionOption = await prisma.possibleAnswerQuestion.create({
        data: option
    });
    if (!createdQuestionOption) {
        return null;
    }
    return new PossibleAnswerQuestion({ ...createdQuestionOption });
}

export const createUserClassState = async (state: UserClassesState): Promise<UserClassesState | null> => {
    const existState = await prisma.userClassesState.findFirst({
        where: {
            userCourseId: state.userCourseId,
            classId: state.classId
        }
    });

    let userClassState: UserClassesState | null = null;
    if (!existState) {
        userClassState = await prisma.userClassesState.create({
            data: {
                userCourseId: state.userCourseId,
                classId: state.classId,
                completed: state.completed,
                currentVideoTime: state.currentVideoTime
            }
        });
    } else {
        userClassState = await prisma.userClassesState.update({
            where: {
                id: existState.id
            },
            data: {
                completed: existState.completed ? existState.completed : state.completed,
                currentVideoTime: state.currentVideoTime
            },
        });
    }

    if (!userClassState) {
        return null;
    }

    return new UserClassesState({ ...userClassState });
}

export const createUserModuleFinishState = async (state: UserModuleState): Promise<UserModuleState | null> => {
    let userClassState = await prisma.userModuleState.findFirst({
        where: {
            userCourseId: state.userCourseId,
            moduleId: state.moduleId
        }
    });

    if (!userClassState) {
        userClassState = await prisma.userModuleState.create({
            data: {
                userCourseId: state.userCourseId,
                moduleId: state.moduleId,
                completed: true,
            }
        });
    }

    if (!userClassState) {
        return null;
    }

    return new UserModuleState({ ...userClassState });
}

export const createQuestionAnswer = async (answer: UserQuizAnswer): Promise<UserQuizAnswer | null> => {
    const existAnswer = await prisma.userQuizAnswer.findFirst({
        where: {
            userCourseId: answer.userCourseId,
            quizId: answer.quizId,
            questionId: answer.questionId
        }
    });

    let userQuestionAnswer: UserQuizAnswer | null = null;
    if (!existAnswer) {
        userQuestionAnswer = await prisma.userQuizAnswer.create({
            data: {
                userCourseId: answer.userCourseId,
                quizId: answer.quizId,
                questionId: answer.questionId,
                correct: answer.correct,
                answer: answer.answer,
                isCorrect: answer.isCorrect,
                points: answer.points
            }
        });
    } else {
        userQuestionAnswer = await prisma.userQuizAnswer.update({
            where: {
                id: existAnswer.id
            },
            data: {
                correct: answer.correct,
                answer: answer.answer,
                isCorrect: answer.isCorrect,
                points: answer.points
            }
        });
    }

    if (!userQuestionAnswer) {
        return null;
    }

    return new UserQuizAnswer({ ...userQuestionAnswer });
}

export const createUserModuleState = async (state: UserModuleState): Promise<UserModuleState | null> => {
    const userClassState = await prisma.userModuleState.create({
        data: {
            userCourseId: state.userCourseId,
            moduleId: state.moduleId,
            completed: state.completed,
        }
    });
    if (!userClassState) {
        return null;
    }
    return new UserModuleState({ ...userClassState });
}

export const updateCourse = async (courseId: number, data: Partial<Course>): Promise<Course> => {
    const { category, courseModules, cart, userCourse, ...updateData } = data;
    const updatedCourse = await prisma.course.update({
        where: { id: courseId },
        data: updateData,
    });
    return new Course({ ...updatedCourse });
};

export const updateModule = async (moduleId: number, data: Partial<CourseModules>): Promise<CourseModules> => {
    const { moduleClass, moduleQuiz, ...updateData } = data;
    const updatedModule = await prisma.courseModules.update({
        where: { id: moduleId },
        data: updateData,
    });
    return new CourseModules({ ...updatedModule });
};

export const updateClass = async (classId: number, data: Partial<ModuleClass>): Promise<ModuleClass> => {
    const updatedClass = await prisma.moduleClass.update({
        where: { id: classId },
        data,
    });
    return new ModuleClass({ ...updatedClass });
};

export const updateQuiz = async (quizId: number, data: Partial<ModuleQuiz>): Promise<ModuleQuiz> => {
    const { quizQuestion, userQuizState, ...updateData } = data;
    const updatedQuiz = await prisma.moduleQuiz.update({
        where: { id: quizId },
        data: updateData,
    });
    return new ModuleQuiz({ ...updatedQuiz });
};

export const updateQuestion = async (questionId: number, data: Partial<QuizQuestion>): Promise<QuizQuestion> => {
    const { possibleAnswerQuestion, ...updateData } = data;
    const updatedQuestion = await prisma.quizQuestion.update({
        where: { id: questionId },
        data: updateData,
    });
    return new QuizQuestion({ ...updatedQuestion });
};

export const updateOption = async (optionId: number, data: Partial<PossibleAnswerQuestion>): Promise<PossibleAnswerQuestion> => {
    const updatedOption = await prisma.possibleAnswerQuestion.update({
        where: { id: optionId },
        data: data,
    });
    return new PossibleAnswerQuestion({ ...updatedOption });
};

export const deleteCourse = async (courseId: number): Promise<void> => {
    await prisma.course.delete({
        where: { id: courseId },
    });
};

export const deleteModule = async (moduleId: number): Promise<void> => {
    await prisma.courseModules.delete({
        where: { id: moduleId },
    });
};

export const deleteClass = async (classId: number): Promise<void> => {
    await prisma.moduleClass.delete({
        where: { id: classId },
    });
};

export const deleteQuiz = async (quizId: number): Promise<void> => {
    await prisma.moduleQuiz.delete({
        where: { id: quizId },
    });
};

export const deleteQuestion = async (questionId: number): Promise<void> => {
    await prisma.quizQuestion.delete({
        where: { id: questionId },
    });
};

export const deleteOption = async (optionId: number): Promise<void> => {
    await prisma.possibleAnswerQuestion.delete({
        where: { id: optionId },
    });
};
