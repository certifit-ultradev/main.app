/* ---------- change-types.ts ---------- */
import { CourseElement } from "./diff";
import {
    CourseData,
    CourseModule,
    ModuleClass,
    QuizModule,
    QuizQuestions,
    QuestionOption,
} from "./types";

export type Path = Record<string, number | string | null>;

interface BaseChange<T, A extends "added" | "updated" | "deleted"> {
    type: T;
    action: A;
    path: Path;
    data?: Partial<CourseElement>; 
}

export type CourseChange =
    | (BaseChange<"course", "added" | "updated"> & { data: Partial<CourseData> })
    | (BaseChange<"module", "added" | "updated"> & { data: Partial<CourseModule> })
    | (BaseChange<"class", "added" | "updated"> & { data: Partial<ModuleClass> })
    | (BaseChange<"quiz", "added" | "updated"> & { data: Partial<QuizModule> })
    | (BaseChange<"question", "added" | "updated"> & {
        data: Partial<QuizQuestions>;
    })
    | (BaseChange<"option", "added" | "updated"> & {
        data: Partial<QuestionOption>;
    })
    | BaseChange<
        "course" | "module" | "class" | "quiz" | "question" | "option",
        "deleted"
    >;
