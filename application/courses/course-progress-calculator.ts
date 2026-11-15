export type CourseProgressInput = {
    modules?: Array<{ classes?: Array<{ id?: number; title?: string }> }>;
    classViewed?: Array<{ classId: number; completed: boolean }> | null;
};

export type CourseProgressSummary = {
    classesWithCompletion: Array<{ id?: number; title: string; completed: boolean }>;
    visibleClasses: Array<{ id?: number; title: string; completed: boolean }>;
    progressPercent: number;
    currentIndex: number;
    totalClasses: number;
};

/** Returns `null` only when the course projection itself has no modules field. */
export const calculateCourseProgress = (course: CourseProgressInput): CourseProgressSummary | null => {
    if (!course.modules) return null;
    const classes = course.modules.flatMap((module) => module.classes ?? []);
    const viewed = new Map(course.classViewed?.map((item) => [item.classId, item.completed]));
    const classesWithCompletion = classes.map((courseClass) => ({
        id: courseClass.id,
        title: courseClass.title ?? '',
        completed: viewed.get(courseClass.id ?? -1) ?? false,
    }));
    const totalClasses = classesWithCompletion.length;
    if (totalClasses === 0) return { classesWithCompletion, visibleClasses: [], progressPercent: 0, currentIndex: -1, totalClasses };
    const completed = classesWithCompletion.filter((courseClass) => courseClass.completed).length;
    let currentIndex = classesWithCompletion.findIndex((courseClass) => !courseClass.completed);
    if (currentIndex === -1) currentIndex = totalClasses - 1;
    const visibleClasses = totalClasses === 1
        ? classesWithCompletion
        : currentIndex === totalClasses - 1
            ? classesWithCompletion.slice(Math.max(0, currentIndex - 1), currentIndex + 1)
            : classesWithCompletion.slice(currentIndex, currentIndex + 2);
    return { classesWithCompletion, visibleClasses, progressPercent: Math.round((completed / totalClasses) * 100), currentIndex, totalClasses };
};
