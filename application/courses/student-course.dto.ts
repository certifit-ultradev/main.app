/**
 * Serializable course projection for an enrolled student.
 *
 * Assessment solutions deliberately do not exist in this contract.
 */
export type StudentQuestionOptionDto = {
    id: number;
    value: string;
};

export type StudentQuestionDto = { id: number; title: string } & (
    | { type: 'text'; options?: never }
    | { type: 'multiple'; options: StudentQuestionOptionDto[] }
);

export type StudentQuizDto = {
    id: number;
    courseModuleId: number;
    title: string;
    description: string;
    questions: StudentQuestionDto[];
};

export type StudentClassDto = {
    id: number;
    courseModuleId: number;
    title: string;
    description: string;
    video: string | null;
    videoSize: number | null;
    videoDuration: number | null;
};

export type StudentModuleDto = {
    id: number;
    courseId: number;
    title: string;
    minRequiredPoints: number;
    /** Locked modules expose only their identity; lessons and quiz remain private. */
    locked: boolean;
    classes: StudentClassDto[];
    quiz: StudentQuizDto | null;
};

export type StudentCourseProgressDto = {
    moduleCompleted: Array<{ moduleId: number; isCompleted: boolean; createdAt: string }>;
    classCompleted: Array<{
        classId: number;
        currentVideoTime: number;
        isCompleted: boolean;
        createdAt: string;
        lastViewedAt: string;
    }>;
    quizCompleted: Array<{
        quizId: number;
        courseModuleId: number;
        result: number;
        retries: number;
        passed: boolean;
        createdAt: string;
        lastAttemptAt: string;
    }>;
};

export type StudentCourseDto = {
    canonicalId: string;
    title: string;
    description: string;
    courseImage: string;
    instructorName: string;
    instructorPhoto: string;
    expiresAt: string;
    category: { id: number; name: string } | null;
    price: number;
    modules: StudentModuleDto[];
} & StudentCourseProgressDto;

/** Compact, serializable enrollment projection used by the student's course list. */
export type StudentCourseListItemDto = {
    canonicalId: string;
    title: string;
    price: number;
    courseImage: string;
    instructorName: string;
    instructorPhoto: string;
    courseDuration: string;
    category: { id: number; name: string } | null;
    description: string;
    expiresAt: string;
    classViewed: Array<{ classId: number; currentVideoTime: number; completed: boolean }>;
    moduleViewed: Array<{ moduleId: number; completed: boolean }>;
    classesWithCompletion: Array<{ id: number; title: string; completed: boolean }>;
    progressPercent: number;
    currentIndex: number;
    totalClasses: number;
    visibleClasses: Array<{ id: number; title: string; completed: boolean }>;
};
