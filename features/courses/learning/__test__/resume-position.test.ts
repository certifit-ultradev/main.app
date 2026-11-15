import type { StudentCourseDto } from '@/application/courses/student-course.dto';
import { resolveLearningPosition } from '@/features/courses/learning/resume-position';

const timestamp = '2026-01-01T00:00:00.000Z';
const course: StudentCourseDto = {
    canonicalId: 'course-1', title: 'Course', description: '', courseImage: '',
    instructorName: '', instructorPhoto: '', expiresAt: timestamp, category: null, price: 0,
    modules: [
        { id: 10, courseId: 1, title: 'First', minRequiredPoints: 1, locked: false,
            classes: [
                { id: 11, courseModuleId: 10, title: 'Class 1', description: '', video: 'a', videoSize: 1, videoDuration: 10 },
                { id: 12, courseModuleId: 10, title: 'Class 2', description: '', video: 'b', videoSize: 1, videoDuration: 10 },
            ],
            quiz: { id: 13, courseModuleId: 10, title: 'Quiz 1', description: '', questions: [] },
        },
        { id: 20, courseId: 1, title: 'Second', minRequiredPoints: 1, locked: true,
            classes: [], quiz: null,
        },
    ],
    classCompleted: [], moduleCompleted: [], quizCompleted: [],
};

const classState = (classId: number, isCompleted: boolean, lastViewedAt = timestamp) => ({
    classId, isCompleted, currentVideoTime: 5, createdAt: timestamp, lastViewedAt,
});

describe('resolveLearningPosition', () => {
    it('starts at the first unlocked class without progress', () => {
        expect(resolveLearningPosition(course)).toEqual({ kind: 'class', moduleIndex: 0, classIndex: 0, classId: 11 });
    });

    it('resumes the most recently visited unfinished class regardless of array order', () => {
        expect(resolveLearningPosition({ ...course, classCompleted: [
            classState(12, false, '2026-01-03T00:00:00.000Z'),
            classState(11, false, '2026-01-02T00:00:00.000Z'),
        ] })).toEqual({ kind: 'class', moduleIndex: 0, classIndex: 1, classId: 12 });
    });

    it('continues to the next incomplete class or the quiz after completed classes', () => {
        expect(resolveLearningPosition({ ...course, classCompleted: [classState(11, true)] }))
            .toEqual({ kind: 'class', moduleIndex: 0, classIndex: 1, classId: 12 });
        expect(resolveLearningPosition({ ...course, classCompleted: [classState(11, true), classState(12, true)] }))
            .toEqual({ kind: 'quiz', moduleIndex: 0, moduleId: 10, quizId: 13 });
    });

    it('continues into the next unlocked module after the prior quiz was passed', () => {
        const next = { ...course.modules[1], locked: false,
            classes: [{ id: 21, courseModuleId: 20, title: 'Class 3', description: '', video: 'c', videoSize: 1, videoDuration: 10 }],
            quiz: { id: 22, courseModuleId: 20, title: 'Quiz 2', description: '', questions: [] },
        };
        expect(resolveLearningPosition({ ...course, modules: [course.modules[0], next],
            classCompleted: [classState(11, false)],
            quizCompleted: [{ quizId: 13, courseModuleId: 10, result: 1, retries: 1, passed: true,
                createdAt: timestamp, lastAttemptAt: timestamp }],
        })).toEqual({ kind: 'class', moduleIndex: 1, classIndex: 0, classId: 21 });
    });

    it('resumes a previously passed module when its class was revisited after later quizzes', () => {
        const second = { ...course.modules[1], locked: false,
            classes: [{ id: 21, courseModuleId: 20, title: 'Class 3', description: '', video: 'c', videoSize: 1, videoDuration: 10 }],
            quiz: { id: 22, courseModuleId: 20, title: 'Quiz 2', description: '', questions: [] },
        };
        const third = { ...second, id: 30,
            classes: [{ id: 31, courseModuleId: 30, title: 'Class 4', description: '', video: 'd', videoSize: 1, videoDuration: 10 }],
            quiz: { id: 32, courseModuleId: 30, title: 'Quiz 3', description: '', questions: [] },
        };
        const progressed: StudentCourseDto = { ...course,
            modules: [course.modules[0], second, third],
            classCompleted: [classState(12, false, '2026-01-02T00:00:00.000Z')],
            quizCompleted: [
                { quizId: 13, courseModuleId: 10, result: 1, retries: 1, passed: true,
                    createdAt: '2026-01-03T00:00:00.000Z', lastAttemptAt: '2026-01-03T00:00:00.000Z' },
                { quizId: 22, courseModuleId: 20, result: 1, retries: 1, passed: true,
                    createdAt: '2026-01-04T00:00:00.000Z', lastAttemptAt: '2026-01-04T00:00:00.000Z' },
            ],
        };

        expect(resolveLearningPosition(progressed)).toEqual({ kind: 'class', moduleIndex: 2, classIndex: 0, classId: 31 });
        expect(resolveLearningPosition({ ...progressed, classCompleted: [classState(12, false, '2026-01-05T00:00:00.000Z')] }))
            .toEqual({ kind: 'class', moduleIndex: 0, classIndex: 1, classId: 12 });
        expect(resolveLearningPosition({ ...progressed, classCompleted: [classState(12, true, '2026-01-05T00:00:00.000Z')] }))
            .toEqual({ kind: 'class', moduleIndex: 0, classIndex: 1, classId: 12 });
    });
});
