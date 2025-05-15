import {
    QuizQuestions,
    QuestionOption,
    ModuleClass,
    CourseModule,
} from "./types";

export const isQuestion = (d: unknown): d is QuizQuestions =>
    !!d && typeof d === "object" && "points" in d;

export const isOption = (d: unknown): d is QuestionOption =>
    !!d && typeof d === "object" && "isCorrect" in d;

export const isModuleClass = (d: unknown): d is ModuleClass =>
    !!d && typeof d === "object" && "videoDuration" in d;

export const isCourseModule = (d: unknown): d is CourseModule =>
    !!d && typeof d === "object" && "minRequiredPoints" in d;