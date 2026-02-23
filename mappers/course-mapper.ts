import { CourseModules } from "@/models/course-modules";
import { ModuleClass } from "@/models/module-class";
import { ModuleQuiz } from "@/models/module-quiz";
import { PossibleAnswerQuestion } from "@/models/possible-answer-question";
import { QuizQuestion } from "@/models/quiz-question";
import { Course } from "@/models/course";
import { UserCourse } from "@/models/user-course";
import { 
    CourseModule, 
    ModuleClass as ModuleClassDTO, 
    QuizModule, 
    QuizQuestions, 
    QuestionOption,
    CoursePlainData,
    RemapedCourse,
    CoursePublicDataWithOutCompletion 
} from "@/utils/types";
import { calculateTotalVideoDuration, formatVideoDuration } from "@/utils/video";
import { getCourseProgress } from "@/utils/classes";

/**
 * Mapper para clases de módulo
 */
export class ClassMapper {
    /**
     * Convierte ModuleClass (entidad) a ModuleClassDTO (DTO para frontend)
     */
    static toDTO(cls: ModuleClass): ModuleClassDTO {
        return {
            id: cls.id,
            courseModuleId: cls.courseModuleId,
            title: cls.title,
            description: cls.description,
            video: cls.videoPath,
            videoDuration: cls.videoDuration,
            videoSize: cls.videoSize,
        };
    }

    /**
     * Convierte array de ModuleClass a array de DTOs
     */
    static toDTOArray(classes: ModuleClass[] | null | undefined): ModuleClassDTO[] | undefined {
        return classes?.map(cls => this.toDTO(cls));
    }
}

/**
 * Mapper para opciones de preguntas
 */
export class OptionMapper {
    /**
     * Convierte PossibleAnswerQuestion a QuestionOption DTO
     */
    static toDTO(option: PossibleAnswerQuestion, hideCorrectAnswer = false): QuestionOption {
        return {
            id: option.id,
            quizQuestionId: option.questionId,
            value: option.value,
            isCorrect: hideCorrectAnswer ? false : option.isCorrect,
        };
    }

    /**
     * Convierte con ocultación de respuesta correcta (para texto)
     */
    static toDTOHidden(option: PossibleAnswerQuestion, questionType: string): QuestionOption {
        return {
            id: option.id,
            quizQuestionId: option.questionId,
            value: questionType === 'text' ? '' : option.value,
            isCorrect: false,
        };
    }

    static toDTOArray(
        options: PossibleAnswerQuestion[] | null | undefined, 
        hideCorrect = false
    ): QuestionOption[] | undefined {
        return options?.map(opt => this.toDTO(opt, hideCorrect));
    }
}

/**
 * Mapper para preguntas de quiz
 */
export class QuestionMapper {
    /**
     * Convierte QuizQuestion a QuizQuestions DTO
     */
    static toDTO(question: QuizQuestion, hideAnswers = false): QuizQuestions {
        return {
            id: question.id,
            quizModuleId: question.quizId,
            title: question.title,
            type: question.type,
            points: question.points,
            options: hideAnswers
                ? question.possibleAnswerQuestion?.map(opt => 
                    OptionMapper.toDTOHidden(opt, question.type)
                )
                : OptionMapper.toDTOArray(question.possibleAnswerQuestion),
        };
    }

    static toDTOArray(
        questions: QuizQuestion[] | null | undefined, 
        hideAnswers = false
    ): QuizQuestions[] | undefined {
        return questions?.map(q => this.toDTO(q, hideAnswers));
    }
}

/**
 * Mapper para quizzes
 */
export class QuizMapper {
    /**
     * Convierte ModuleQuiz a QuizModule DTO
     */
    static toDTO(quiz: ModuleQuiz | undefined, hideAnswers = false): QuizModule | undefined {
        if (!quiz) return undefined;

        return {
            id: quiz.id,
            courseModuleId: quiz.courseModuleId,
            title: quiz.title,
            description: quiz.description ?? undefined,
            questions: QuestionMapper.toDTOArray(quiz.quizQuestion, hideAnswers),
        };
    }

    /**
     * Convierte el primer quiz del array (patrón común en el proyecto)
     */
    static fromArrayToDTO(
        quizzes: ModuleQuiz[] | null | undefined, 
        hideAnswers = false
    ): QuizModule | undefined {
        const quiz = quizzes?.[0];
        return this.toDTO(quiz, hideAnswers);
    }
}

/**
 * Mapper para módulos de curso
 */
export class ModuleMapper {
    /**
     * Convierte CourseModules (entidad) a CourseModule (DTO)
     */
    static toDTO(module: CourseModules, options?: { hideQuizAnswers?: boolean }): CourseModule {
        const { hideQuizAnswers = false } = options ?? {};

        return {
            id: module.id,
            courseId: module.courseId,
            title: module.title,
            minRequiredPoints: module.minRequiredPoints,
            classes: ClassMapper.toDTOArray(module.moduleClass),
            quiz: QuizMapper.fromArrayToDTO(module.moduleQuiz, hideQuizAnswers),
        };
    }

    /**
     * Convierte CourseModules sin quiz (para listados públicos)
     */
    static toDTOWithoutQuiz(module: CourseModules): CourseModule {
        return {
            id: module.id,
            courseId: module.courseId,
            title: module.title,
            minRequiredPoints: module.minRequiredPoints,
            classes: ClassMapper.toDTOArray(module.moduleClass),
            quiz: undefined,
        };
    }

    static toDTOArray(
        modules: CourseModules[] | null | undefined, 
        options?: { hideQuizAnswers?: boolean; excludeQuiz?: boolean }
    ): CourseModule[] | undefined {
        if (!modules) return undefined;

        if (options?.excludeQuiz) {
            return modules.map(m => this.toDTOWithoutQuiz(m));
        }

        return modules.map(m => this.toDTO(m, options));
    }
}

/**
 * Mapper para cursos
 */
export class CourseMapper {
    /**
     * Convierte Course a CoursePlainData (datos públicos para listados)
     */
    static toPlainData(course: Course, isAlreadyPurchased = false): CoursePlainData {
        const modules = ModuleMapper.toDTOArray(course.courseModules, { excludeQuiz: true });
        const videoDuration = formatVideoDuration(calculateTotalVideoDuration(modules ?? []));

        return {
            id: course.id,
            canonicalId: course.canonicalId,
            title: course.title,
            price: course.price,
            courseImage: course.courseImage,
            courseDuration: videoDuration,
            instructorName: course.instructorName,
            instructorPhoto: course.instructorPhoto,
            category: course.category,
            description: course.description,
            expiresAt: course.expiresAt,
            alreadyPurchased: isAlreadyPurchased,
        };
    }

    /**
     * Convierte UserCourse a CoursePublicDataWithOutCompletion
     */
    static fromUserCourseToPublicData(userCourse: UserCourse): CoursePublicDataWithOutCompletion {
        const course = userCourse.course;
        if (!course) {
            throw new Error('UserCourse does not have associated course data');
        }

        const modules = ModuleMapper.toDTOArray(course.courseModules, { excludeQuiz: true });
        
        const remapedCourse: RemapedCourse = {
            canonicalId: course.canonicalId ?? '',
            title: course.title ?? '',
            price: course.price ?? 0,
            courseDuration: formatVideoDuration(calculateTotalVideoDuration(modules ?? [])),
            courseImage: course.courseImage,
            instructorName: course.instructorName ?? '',
            instructorPhoto: course.instructorPhoto,
            category: course.category,
            description: course.description ?? '',
            expiresAt: course.expiresAt ?? new Date(),
            classViewed: userCourse.userClassesState,
            moduleViewed: userCourse.userModuleState,
            modules: modules,
        };

        const progressCalculation = getCourseProgress(remapedCourse);

        return {
            canonicalId: remapedCourse.canonicalId,
            title: remapedCourse.title,
            price: remapedCourse.price,
            courseDuration: remapedCourse.courseDuration,
            courseImage: remapedCourse.courseImage,
            instructorName: remapedCourse.instructorName,
            instructorPhoto: remapedCourse.instructorPhoto,
            category: remapedCourse.category,
            description: remapedCourse.description,
            expiresAt: remapedCourse.expiresAt,
            modules: undefined, // Se excluye del resultado final
            classViewed: remapedCourse.classViewed,
            moduleViewed: remapedCourse.moduleViewed,
            classesWithCompletion: progressCalculation?.classesWithCompletion,
            visibleClasses: progressCalculation?.visibleClasses,
            progressPercent: progressCalculation?.progressPercent ?? 0,
            currentIndex: progressCalculation?.currentIndex ?? 0,
            totalClasses: progressCalculation?.totalClasses ?? 0,
        };
    }

    /**
     * Convierte array de UserCourse a array de CoursePublicDataWithOutCompletion
     */
    static fromUserCoursesToPublicData(userCourses: UserCourse[]): CoursePublicDataWithOutCompletion[] {
        return userCourses.map(uc => this.fromUserCourseToPublicData(uc));
    }
}
