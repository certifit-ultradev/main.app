import { Course } from "@/models/course";
import { CourseModules } from "@/models/course-modules";
import { allCourses, countAllActiveCourses, countAllCourses, countCourseSales, createFullCourse, createQuestionAnswer, createUserClassState, createUserModuleFinishState, createUserQuizState, findCourseByCanonicalId, findCourseById, findModulesByCourseId, findQuizAnswersByQuizId, findThreeCoursesActives, findUserCourseByCanonicalId, findUserCourses, findUserCourseWithModulesByCanonicalId, findUserQuizState, sumCourseSalesByLastMonth, sumUsersByLastMonth, updateClass, updateCourse, updateFullCourse } from "@/repository/courses";
import { CalculateQuizScore, CourseData, CourseModule, CoursePlainData, CoursePublicDataWithOutCompletion, CoursesMonthResult, CreateQuestionAnswer, DataPaginated, RemapedCourse, RequestDataPaginated, ResultQuizScore, ResultSalesCourse, UsersMonthResult } from "@/utils/types";
import { QuizQuestion } from "@/models/quiz-question";
import { diffCourses } from "@/utils/diff";
import { PossibleAnswerQuestion } from "@/models/possible-answer-question";
import { calculateTotalVideoDuration, formatVideoDuration } from "@/utils/video";
import { auth } from "@/auth";
import { UserClassesState } from "@/models/user-classes-state";
import { UserQuizAnswer } from "@/models/user-quiz-answer";
import { UserModuleState } from "@/models/user_module_state";
import { UserCourse } from "@/models/user-course";
import { UserNotLoggedError } from "@/exceptions/user-not-logged";
import { logPrismaError } from "@/exceptions/error-encoder";
import { getCourseProgress } from "@/utils/classes";
import { UserQuizState } from "@/models/user-quiz-state";
import { NotFoundError } from "@/exceptions/not-found";
import { CourseChange } from "@/utils/change-types";
import { CourseNotPurchasedError } from "@/exceptions/course-not-purchased";

export const COURSES_PAGE_SIZE = 10;

/**
 * 
 * @param request 
 * @returns 
 */
export const getAllCourses = async (request: RequestDataPaginated): Promise<DataPaginated<Course>> => {
    try {
        const pagedCourses = await allCourses(request.page, COURSES_PAGE_SIZE);
        const totalUsers = await countAllCourses();
        const totalPages = Math.ceil(totalUsers / COURSES_PAGE_SIZE);

        return {
            data: pagedCourses,
            page: request.page,
            lastPage: totalPages,
            total: totalPages
        }
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @param id 
 * @returns 
 */
export const getCourseById = async (id: number): Promise<Course> => {
    try {
        return await findCourseById(id);
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @param courseId 
 * @returns 
 */
export const getModulesByCourseId = async (courseId: number): Promise<CourseModules[]> => {
    try {
        return await findModulesByCourseId(courseId);
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @param canonicalId 
 * @returns 
 */
export const getUserCourseWithModulesByCanonicalId = async (canonicalId: string): Promise<Course> => {
    try {
        const session = await auth();
        const userID = session?.user.id;
        if (!userID) {
            throw new UserNotLoggedError("El usuario debe loguearse");
        }
        const isEmailVerified = session?.user.emailVerified;
        if (!isEmailVerified) {
            throw new UserNotLoggedError("El usuario debe verificar su email");
        }

        let course = await findUserCourseWithModulesByCanonicalId(canonicalId, userID);
        if (!course.courseModules) {
            throw new CourseNotPurchasedError("El curso no puede ser visto, intente mas tarde.");
        }

        if (course.userCourse?.length == 0) {
            throw new CourseNotPurchasedError("El curso no puede ser visto, no te pertenece");
        }

        course.courseModules = course.courseModules?.map((courseModule): CourseModules => ({
            ...courseModule,
            moduleQuiz: [
                {
                    id: courseModule.moduleQuiz?.[0].id,
                    courseModuleId: courseModule.moduleQuiz?.[0].courseModuleId as number,
                    title: courseModule.moduleQuiz?.[0].title ?? '',
                    description: courseModule.moduleQuiz?.[0].description ?? '',
                    quizQuestion: courseModule.moduleQuiz?.[0].quizQuestion?.map((question): QuizQuestion => ({
                        ...question,
                        possibleAnswerQuestion: question.possibleAnswerQuestion?.map((option): PossibleAnswerQuestion => ({
                            ...option,
                            value: question.type == 'text' ? '' : option.value,
                            isCorrect: false,
                        })) ?? null
                    })),
                }
            ],
            moduleClass: courseModule.moduleClass
        }));

        return course;
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @param canonicalId 
 * @param quizId 
 * @returns 
 */
export const getUserCourseQuizAnswers = async (canonicalId: string, quizId: number): Promise<UserQuizAnswer[]> => {
    try {
        const session = await auth();
        const userID = session?.user.id;
        if (!userID) {
            throw new UserNotLoggedError("El usuario debe loguearse");
        }
        const isEmailVerified = session?.user.emailVerified;
        if (!isEmailVerified) {
            throw new UserNotLoggedError("El usuario debe verificar su email");
        }

        let course = await findUserCourseByCanonicalId(canonicalId, userID);
        if (course.userCourse?.length == 0) {
            throw new Error("Este curso no pertenece al usuario");
        }

        let userCourseId = course.userCourse![0].id as number;
        return await findQuizAnswersByQuizId(userCourseId, quizId);
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @param canonicalId 
 * @returns 
 */
export const getUserCourseByCanonicalId = async (canonicalId: string): Promise<Course> => {
    try {
        const session = await auth();
        const userId = session?.user.id;
        if (!userId) {
            throw new UserNotLoggedError("El usuario debe loguearse");
        }
        const isEmailVerified = session?.user.emailVerified;
        if (!isEmailVerified) {
            throw new UserNotLoggedError("El usuario debe verificar su email");
        }

        return await findUserCourseByCanonicalId(canonicalId, userId);
    } catch (error) {
        logPrismaError(error);
        if (error instanceof NotFoundError) {
            return {} as Course;
        }
        throw error;
    }
}

/**
 * 
 * @param canonicalId 
 * @returns 
 */
export const getCourseByCanonicalId = async (canonicalId: string): Promise<Course> => {
    try {
        const session = await auth();
        const userID = session?.user.id;
        if (!userID) {
            throw new UserNotLoggedError("El usuario debe loguearse");
        }
        const isEmailVerified = session?.user.emailVerified;
        if (!isEmailVerified) {
            throw new UserNotLoggedError("El usuario debe verificar su email");
        }

        return await findCourseByCanonicalId(canonicalId, userID);
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @returns 
 */
export const getTopThreeCourses = async (): Promise<CoursePlainData[]> => {
    try {
        const session = await auth();
        const userID = session?.user.id;
        const activeCourses = await findThreeCoursesActives(userID);

        // filter active courses by expiresAt
        const now = new Date();
        const filteredActiveCourses = activeCourses.filter((course: Course) => {
            return course.expiresAt > now;
        });

        return filteredActiveCourses.map<CoursePlainData>((course: Course) => {
            const modules = course.courseModules?.map((courseModule): CourseModule => ({
                id: courseModule.id,
                courseId: courseModule.courseId,
                title: courseModule.title,
                minRequiredPoints: courseModule.minRequiredPoints,
                quiz: undefined,
                classes: courseModule.moduleClass?.map((cls) => ({
                    id: cls.id,
                    courseModuleId: cls.courseModuleId,
                    title: cls.title,
                    description: cls.description,
                    video: cls.videoPath,
                    videoDuration: cls.videoDuration,
                    videoSize: cls.videoSize
                }))
            }));

            const videoDur = formatVideoDuration(calculateTotalVideoDuration(modules ?? []))
            const isAlreadyPurchased = (course.userCourse?.length ?? 0) > 0;

            return {
                id: course.id,
                canonicalId: course.canonicalId,
                title: course.title,
                price: course.price,
                courseImage: course.courseImage,
                courseDuration: videoDur,
                instructorName: course.instructorName,
                instructorPhoto: course.instructorPhoto,
                category: course.category,
                description: course.description,
                expiresAt: course.expiresAt,
                alreadyPurchased: isAlreadyPurchased
            }
        });
    } catch (error) {
        logPrismaError(error);
        return [];
    }
}

/**
 * 
 * @returns 
 */
export const getUserCourses = async (): Promise<CoursePublicDataWithOutCompletion[]> => {
    try {
        const session = await auth();
        const userID = session?.user.id;
        if (!userID) {
            throw new UserNotLoggedError("El usuario debe loguearse");
        }
        const isEmailVerified = session?.user.emailVerified;
        if (!isEmailVerified) {
            throw new UserNotLoggedError("El usuario debe verificar su email");
        }
        const userCourses = await findUserCourses(userID);
        return userCourses.map<CoursePublicDataWithOutCompletion>((userCourse: UserCourse) => {
            const modules = userCourse.course?.courseModules?.map((courseModule): CourseModule => ({
                id: courseModule.id,
                courseId: courseModule.courseId,
                title: courseModule.title,
                minRequiredPoints: courseModule.minRequiredPoints,
                quiz: undefined,
                classes: courseModule.moduleClass?.map((cls) => ({
                    id: cls.id,
                    courseModuleId: cls.courseModuleId,
                    title: cls.title,
                    description: cls.description,
                    video: cls.videoPath,
                    videoDuration: cls.videoDuration,
                    videoSize: cls.videoSize
                }))
            }));

            const remapedCourse: RemapedCourse = {
                canonicalId: userCourse.course?.canonicalId as string,
                title: userCourse.course?.title as string,
                price: userCourse.course?.price as number,
                courseDuration: formatVideoDuration(calculateTotalVideoDuration(modules ?? [])),
                courseImage: userCourse.course?.courseImage,
                instructorName: userCourse.course?.instructorName as string,
                instructorPhoto: userCourse.course?.instructorPhoto,
                category: userCourse.course?.category,
                description: userCourse.course?.description ?? "",
                expiresAt: userCourse.course?.expiresAt as Date,
                classViewed: userCourse.userClassesState,
                moduleViewed: userCourse.userModuleState,
                modules: modules,
            };

            const progressCalculation = getCourseProgress(remapedCourse);

            delete remapedCourse['modules'];

            return {
                ...remapedCourse,
                classesWithCompletion: progressCalculation?.classesWithCompletion,
                visibleClasses: progressCalculation?.visibleClasses,
                progressPercent: progressCalculation?.progressPercent as number,
                currentIndex: progressCalculation?.currentIndex as number,
                totalClasses: progressCalculation?.totalClasses as number,
            };
        });
    } catch (error) {
        logPrismaError(error);
        return [];
    }
}

/**
 * 
 * @param course 
 * @returns 
 */
export const registerCourse = async (course: CourseData): Promise<Course> => {
    try {
        return await createFullCourse(course);
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @param courseId 
 * @param course 
 * @returns 
 */
export const editCourse = async (originalCourseData: CourseData, newCourseData: CourseData) => {
    try {
        if (!originalCourseData.id) {
            throw new Error("El curso no tiene identificador valido");
        }

        const changes = diffCourses(originalCourseData, newCourseData) as CourseChange[];
        const adds = changes.filter((change: CourseChange) => {
            return change.action == 'added';
        });

        const updates = changes.filter((change: CourseChange) => {
            return change.action == 'updated';
        });

        const deletes = changes.filter((change: CourseChange) => {
            return change.action == 'deleted';
        });

        await updateFullCourse(originalCourseData.id, adds, updates, deletes);
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @param courseId 
 * @param videoPath 
 * @param videoSize 
 * @returns 
 */
export const updateClassVideoPath = async (clsId: number, videoPath: string, videoSize: number) => {
    try {
        const result = await updateClass(clsId, {
            videoPath: videoPath,
            videoSize: videoSize,
        });

        return result;
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @param id 
 * @returns 
 */
export const activateCourse = async (id: number) => {
    try {
        const countActiveCourses = await countAllActiveCourses();
        if (countActiveCourses === 3) {
            return { success: false, message: "Solo se pueden tener 3 cursos activos" };
        }

        const updateResult = await updateCourse(id, { isActive: true });
        if (!updateResult) {
            return { success: false, message: "No se pudo activar el curso" };
        }

        return { success: true, message: "Curso activado correctamente" };
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @param id 
 * @returns 
 */
export const deactivateCourse = async (id: number) => {
    try {
        const updateResult = await updateCourse(id, { isActive: false });
        if (!updateResult) {
            return { success: false, message: "No se pudo desactivar el curso" };
        }

        return { success: true, message: "Curso desactivado" };
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @param courseId 
 * @param classId 
 * @param currentVideoTime 
 * @param isCompleted 
 * @returns 
 */
export const registerClassCurrentState = async (courseId: string, classId: number, currentVideoTime: number, isCompleted: boolean) => {
    try {
        const session = await auth();
        const userID = session?.user.id;
        if (!userID) {
            throw new UserNotLoggedError("El usuario debe loguearse");
        }
        const isEmailVerified = session?.user.emailVerified;
        if (!isEmailVerified) {
            throw new UserNotLoggedError("El usuario debe verificar su email");
        }
        const courseData = await findUserCourseWithModulesByCanonicalId(courseId, userID);
        if (!courseData.userCourse) {
            throw new Error("El curso no le pertenece al usuario");
        }

        const userCourseId = courseData.userCourse[0].id as number;
        const currentClassState = await createUserClassState(new UserClassesState({
            userCourseId,
            classId,
            currentVideoTime,
            completed: isCompleted
        }));

        if (!currentClassState) {
            return { success: false, message: "No se pudo gaurdar el estado de la clase" };
        }

        return { success: true };
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @param courseId 
 * @param moduleId 
 * @returns 
 */
export const registerModuleFinishtState = async (courseId: string, moduleId: number) => {
    try {
        const session = await auth();
        const userID = session?.user.id;
        if (!userID) {
            throw new UserNotLoggedError("El usuario debe loguearse");
        }
        const isEmailVerified = session?.user.emailVerified;
        if (!isEmailVerified) {
            throw new UserNotLoggedError("El usuario debe verificar su email");
        }
        const courseData = await findUserCourseWithModulesByCanonicalId(courseId, userID);
        if (!courseData.userCourse) {
            throw new Error("El curso no le pertenece al usuario");
        }

        const userCourseId = courseData.userCourse[0].id as number;
        const currentModuleState = await createUserModuleFinishState(new UserModuleState({
            userCourseId,
            moduleId,
            completed: true
        }));

        if (!currentModuleState) {
            return { success: false, message: "No se pudo gaurdar el estado del modulo" };
        }

        return { success: true };
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @param data 
 * @returns 
 */
export const registerQuestionAnswer = async (data: CreateQuestionAnswer) => {
    try {
        const session = await auth();
        const userID = session?.user.id;
        if (!userID) {
            throw new UserNotLoggedError("El usuario debe loguearse");
        }
        const isEmailVerified = session?.user.emailVerified;
        if (!isEmailVerified) {
            throw new UserNotLoggedError("El usuario debe verificar su email");
        }
        const courseData = await findUserCourseWithModulesByCanonicalId(data.canonicalId, userID);
        if (!courseData.userCourse) {
            throw new Error("El curso no le pertenece al usuario");
        }

        const module = courseData.courseModules?.find((module) => module.id === data.moduleId);
        if (!module) {
            throw new Error("Modulo invalido");
        }

        if (module.moduleQuiz![0].id != data.quizId) {
            throw new Error("Quiz invalido");
        }

        const question = module.moduleQuiz![0].quizQuestion?.find((question) => question.id === data.questionId);
        if (!question) {
            throw new Error("Pregunta invalida");
        }

        const option = question.possibleAnswerQuestion?.find((option) => option.id === data.optionId);

        let isCorrect = false;
        let correctOption: PossibleAnswerQuestion = {
            questionId: 0,
            value: '',
            isCorrect: false
        };
        switch (question.type) {
            case 'text':
                isCorrect = option?.value === data.answer;
                correctOption = question.possibleAnswerQuestion?.pop() as PossibleAnswerQuestion;
                break;
            case 'multiple':
                isCorrect = option?.isCorrect as boolean;
                correctOption = question.possibleAnswerQuestion?.find((option) => option.isCorrect) as PossibleAnswerQuestion;
                break;
        }

        const userCourseId = courseData.userCourse[0].id as number;
        const answerQuestionCreated = await createQuestionAnswer(new UserQuizAnswer({
            userCourseId: userCourseId,
            questionId: data.questionId,
            quizId: data.quizId,
            answer: data.answer as string,
            correct: correctOption?.value,
            isCorrect,
            points: isCorrect ? question.points : 0
        }));

        if (!answerQuestionCreated) {
            return { success: false, message: "No se pudo gaurdar la respuesta de la pregunta" };
        }

        return { success: true };
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @param data 
 * @returns 
 */
export const calculateQuizScore = async (data: CalculateQuizScore): Promise<ResultQuizScore | null> => {
    try {
        const session = await auth();
        const userID = session?.user.id;
        if (!userID) {
            throw new UserNotLoggedError("El usuario debe loguearse");
        }
        const isEmailVerified = session?.user.emailVerified;
        if (!isEmailVerified) {
            throw new UserNotLoggedError("El usuario debe verificar su email");
        }
        const courseData = await findUserCourseWithModulesByCanonicalId(data.canonicalId, userID);
        if (!courseData.userCourse) {
            throw new Error("El curso no le pertenece al usuario");
        }

        const module = courseData.courseModules?.find((module) => module.id === data.moduleId);
        if (!module) {
            throw new Error("Modulo invalido");
        }

        if (!module.moduleQuiz) {
            throw new Error("Modulo invalido");
        }

        let totalPoints = 0;
        const questionsCount = module.moduleQuiz[0].quizQuestion!.length;
        const userQuizAnswers = await findQuizAnswersByQuizId(courseData.userCourse[0].id as number, data.quizId);

        if (userQuizAnswers.length == 0) {
            throw new Error(`El quiz ${data.quizId} del módulo no tiene respuesta`);
        }

        userQuizAnswers.forEach((userQuizAnswer) => {
            totalPoints = totalPoints + userQuizAnswer.points;
        });

        let currentQuizState: UserQuizState | null = null;
        try {
            currentQuizState = await findUserQuizState(data.quizId, courseData.userCourse[0].id as number);
        } catch (error) {
            if (!(error instanceof NotFoundError)) {
                throw error;
            }
        }

        const retries = !currentQuizState ? 1 : currentQuizState.retries + 1;
        const createdUserQuizState = await createUserQuizState(new UserQuizState({
            quizId: data.quizId,
            userCourseId: courseData.userCourse[0].id as number,
            courseModuleId: module.id as number,
            retries: retries,
            result: totalPoints,
            passed: totalPoints >= module.minRequiredPoints
        }));

        if (!createdUserQuizState) {
            throw new Error("No se pudo registrar el resultado del quiz.");
        }

        return {
            questionCount: questionsCount,
            totalScore: totalPoints,
            pass: totalPoints >= module.minRequiredPoints
        }
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @param canonicalId 
 * @param quizId 
 * @returns 
 */
export const getUserQuizState = async (canonicalId: string, quizId: number): Promise<UserQuizState> => {
    try {
        const session = await auth();
        const userID = session?.user.id;
        if (!userID) {
            throw new UserNotLoggedError("El usuario debe loguearse");
        }
        const isEmailVerified = session?.user.emailVerified;
        if (!isEmailVerified) {
            throw new UserNotLoggedError("El usuario debe verificar su email");
        }

        const courseData = await findUserCourseWithModulesByCanonicalId(canonicalId, userID);
        if (!courseData.userCourse) {
            throw new Error("El curso no le pertenece al usuario");
        }

        return await findUserQuizState(quizId, courseData.userCourse[0].id as number);
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @param canonicalId 
 * @returns 
 */
export const calculateTotalSalesPerCourse = async (): Promise<ResultSalesCourse[]> => {
    try {
        const session = await auth();
        const userID = session?.user.id;
        if (!userID) {
            throw new UserNotLoggedError("El usuario debe loguearse");
        }
        const isEmailVerified = session?.user.emailVerified;
        if (!isEmailVerified) {
            throw new UserNotLoggedError("El usuario debe verificar su email");
        }
        return await countCourseSales();
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @returns 
 */
export const calculateTotalSalesByMonth = async (): Promise<CoursesMonthResult> => {
    try {
        const session = await auth();
        const userID = session?.user.id;
        if (!userID) {
            throw new UserNotLoggedError("El usuario debe loguearse");
        }
        return await sumCourseSalesByLastMonth();
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @returns 
 */
export const calculateUsersRegisteredByMonth = async (): Promise<UsersMonthResult> => {
    try {
        const session = await auth();
        const userID = session?.user.id;
        if (!userID) {
            throw new UserNotLoggedError("El usuario debe loguearse");
        }
        return await sumUsersByLastMonth();
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}