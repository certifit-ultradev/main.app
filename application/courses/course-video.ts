export type CourseVideoModules = Array<{ classes?: Array<{ videoDuration?: number | null }> }>;

export const calculateCourseVideoDuration = (modules: CourseVideoModules): number => modules.reduce(
    (total, module) => total + (module.classes ?? []).reduce((classTotal, lesson) => classTotal + (lesson.videoDuration ?? 0), 0),
    0,
);

export const formatCourseVideoDuration = (duration: number): string => {
    const totalSeconds = Math.max(0, Math.floor(duration));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')} hr ${String(minutes).padStart(2, '0')} mins ${String(seconds).padStart(2, '0')} sec`;
};
