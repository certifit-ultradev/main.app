import type { StudentCourseDto } from '@/application/courses/student-course.dto';

export type LearningPosition =
    | { kind: 'class'; moduleIndex: number; classIndex: number; classId: number }
    | { kind: 'quiz'; moduleIndex: number; moduleId: number; quizId: number };

/** Select the next meaningful item while honoring the server's module locks. */
export function resolveLearningPosition(course: StudentCourseDto): LearningPosition | null {
    const passedQuizzes = new Set(course.quizCompleted.filter((state) => state.passed).map((state) => state.quizId));
    const completedClasses = new Set(course.classCompleted.filter((state) => state.isCompleted).map((state) => state.classId));
    const latestQuizOrModuleProgressAt = Math.max(
        0,
        ...course.quizCompleted.map((state) => Date.parse(state.lastAttemptAt)),
        ...course.moduleCompleted.filter((state) => state.isCompleted).map((state) => Date.parse(state.createdAt)),
    );

    // A deliberate revisit after passing a quiz takes precedence over the next module.
    const recentClasses = [...course.classCompleted]
        .sort((left, right) => Date.parse(right.lastViewedAt) - Date.parse(left.lastViewedAt));
    for (const state of recentClasses) {
        for (let moduleIndex = 0; moduleIndex < course.modules.length; moduleIndex++) {
            const module = course.modules[moduleIndex];
            if (module.locked) continue;
            const classIndex = module.classes.findIndex((lesson) => lesson.id === state.classId);
            if (classIndex !== -1) {
                const modulePassed = module.quiz !== null && passedQuizzes.has(module.quiz.id);
                if (modulePassed && Date.parse(state.lastViewedAt) <= latestQuizOrModuleProgressAt) continue;
                if (state.isCompleted && !modulePassed) continue;
                return { kind: 'class', moduleIndex, classIndex, classId: state.classId };
            }
        }
    }

    // If the latest class was completed, continue to the next class or the module's quiz.
    for (let moduleIndex = 0; moduleIndex < course.modules.length; moduleIndex++) {
        const module = course.modules[moduleIndex];
        if (module.locked || (module.quiz && passedQuizzes.has(module.quiz.id))) continue;
        const classIndex = module.classes.findIndex((lesson) => !completedClasses.has(lesson.id));
        if (classIndex !== -1) {
            return { kind: 'class', moduleIndex, classIndex, classId: module.classes[classIndex].id };
        }
        if (module.quiz) {
            return { kind: 'quiz', moduleIndex, moduleId: module.id, quizId: module.quiz.id };
        }
    }

    // A fully completed course still opens on its last result rather than an empty screen.
    for (let moduleIndex = course.modules.length - 1; moduleIndex >= 0; moduleIndex--) {
        const module = course.modules[moduleIndex];
        if (module.locked) continue;
        if (module.quiz) return { kind: 'quiz', moduleIndex, moduleId: module.id, quizId: module.quiz.id };
        const classIndex = module.classes.length - 1;
        if (classIndex >= 0) return { kind: 'class', moduleIndex, classIndex, classId: module.classes[classIndex].id };
    }
    return null;
}
