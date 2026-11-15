import { GET } from '@/src/app/api/courses/route';
import { getUserCourses } from '@/services/courses';

jest.mock('@/services/courses', () => ({ getUserCourses: jest.fn() }));

const enrolledCourse = {
    canonicalId: 'typescript', title: 'TypeScript', price: 120, courseImage: 'course.png',
    instructorName: 'Ada', instructorPhoto: 'ada.png', courseDuration: '00:01:05',
    category: { id: 2, name: 'Programación' }, description: 'Curso',
    expiresAt: '2030-01-01T00:00:00.000Z', classViewed: [], moduleViewed: [],
    classesWithCompletion: [], progressPercent: 0, currentIndex: 0, totalClasses: 0, visibleClasses: [],
};

describe('GET /api/courses', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns the compact enrolled-course card DTO without legacy course projections', async () => {
        (getUserCourses as jest.Mock).mockResolvedValue([enrolledCourse]);

        const response = await GET();
        const body = await response.json();
        const serialized = JSON.stringify(body);

        expect(response.status).toBe(200);
        expect(body).toEqual({ data: [enrolledCourse] });
        expect(serialized).not.toMatch(/"(?:modules|classCompleted|moduleCompleted|quizCompleted|isCorrect|points)"/);
    });

    it('returns an empty successful collection without a not-found error', async () => {
        (getUserCourses as jest.Mock).mockResolvedValue([]);

        const response = await GET();
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ data: [] });
    });
});
