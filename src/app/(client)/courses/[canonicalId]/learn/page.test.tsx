import LearnPage from '@/src/app/(client)/courses/[canonicalId]/learn/page';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { parseStudentCourseResponse, StudentCourseHttpError } from '@/features/courses/learning/student-course-api';

jest.mock('@/config/env', () => ({ getPublicAppUrl: () => 'https://app.example.com' }));
jest.mock('next/headers', () => ({ headers: jest.fn() }));
jest.mock('next/navigation', () => ({ notFound: jest.fn(), redirect: jest.fn() }));
jest.mock('@/features/courses/learning/student-course-api', () => {
    class MockStudentCourseHttpError extends Error {
        constructor(readonly status: number, message = 'No fue posible cargar el curso') {
            super(message);
            this.name = 'StudentCourseHttpError';
        }
    }

    return { parseStudentCourseResponse: jest.fn(), StudentCourseHttpError: MockStudentCourseHttpError };
});

const course = {
    canonicalId: 'course-1', title: 'Curso', description: 'Descripción', courseImage: 'course.png',
    instructorName: 'Ada', instructorPhoto: 'ada.png', expiresAt: '2030-01-01T00:00:00.000Z',
    category: null, price: 100, modules: [], moduleCompleted: [], classCompleted: [], quizCompleted: [],
};

const mockedNotFound = notFound as unknown as jest.Mock;
const mockedRedirect = redirect as unknown as jest.Mock;

describe('LearnPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (headers as jest.Mock).mockResolvedValue(new Headers({ cookie: 'session=test' }));
        (global.fetch as jest.Mock) = jest.fn().mockResolvedValue(new Response('{}'));
        mockedNotFound.mockImplementation(() => { throw new Error('NEXT_NOT_FOUND'); });
        mockedRedirect.mockImplementation(() => { throw new Error('NEXT_REDIRECT'); });
    });

    it('passes a validated course DTO to the client view', async () => {
        (parseStudentCourseResponse as jest.Mock).mockResolvedValue(course);

        const page = await LearnPage({ params: Promise.resolve({ canonicalId: 'course-1' }) });

        expect(global.fetch).toHaveBeenCalledWith(
            'https://app.example.com/api/courses/course-1',
            expect.objectContaining({ method: 'GET' }),
        );
        expect(page.props.data).toEqual(course);
    });

    it('redirects an unauthenticated student to login with the learning URL', async () => {
        (parseStudentCourseResponse as jest.Mock).mockRejectedValue(new StudentCourseHttpError(401));

        await expect(LearnPage({ params: Promise.resolve({ canonicalId: 'course-1' }) })).rejects.toThrow('NEXT_REDIRECT');
        expect(redirect).toHaveBeenCalledWith('/login?callbackUrl=%2Fcourses%2Fcourse-1%2Flearn');
    });

    it.each([403, 404])('conceals inaccessible courses for HTTP %i', async (status) => {
        (parseStudentCourseResponse as jest.Mock).mockRejectedValue(new StudentCourseHttpError(status));

        await expect(LearnPage({ params: Promise.resolve({ canonicalId: 'course-1' }) })).rejects.toThrow('NEXT_NOT_FOUND');
        expect(notFound).toHaveBeenCalledTimes(1);
    });

    it('fails safely when the HTTP parser rejects an invalid payload', async () => {
        (parseStudentCourseResponse as jest.Mock).mockRejectedValue(
            new StudentCourseHttpError(502, 'El servidor devolvió un curso con un formato inválido'),
        );

        await expect(LearnPage({ params: Promise.resolve({ canonicalId: 'course-1' }) }))
            .rejects.toThrow('El servidor devolvió un curso con un formato inválido');
    });

    it('treats an invalid canonical ID as a missing page without fetching', async () => {
        await expect(LearnPage({ params: Promise.resolve({ canonicalId: '' }) })).rejects.toThrow('NEXT_NOT_FOUND');
        expect(global.fetch).not.toHaveBeenCalled();
    });
});
