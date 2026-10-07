import { calculateCourseProgress } from '@/application/courses/course-progress-calculator';

describe('calculateCourseProgress', () => {
    it('uses null, rather than undefined, when the course projection is absent', () => {
        expect(calculateCourseProgress({})).toBeNull();
    });

    it('uses an empty summary when the course has no classes', () => {
        expect(calculateCourseProgress({ modules: [] })).toEqual({
            classesWithCompletion: [],
            visibleClasses: [],
            progressPercent: 0,
            currentIndex: -1,
            totalClasses: 0,
        });
    });
});
