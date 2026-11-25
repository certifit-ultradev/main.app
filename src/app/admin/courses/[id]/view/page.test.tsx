import { getCourseDataById } from '@/actions/courses/list';
import { safeLogger } from '@/shared/observability/safe-logger';
import { notFound } from 'next/navigation';
import PreviewCoursePage from './page';

jest.mock('@/actions/courses/list', () => ({ getCourseDataById: jest.fn() }));
jest.mock('@/components/course/admin/course-view', () => ({ AdminCourseView: jest.fn() }));
jest.mock('@/shared/observability/safe-logger', () => ({
    safeLogger: { debug: jest.fn() },
}));
jest.mock('next/navigation', () => ({
    notFound: jest.fn(() => { throw new Error('NEXT_NOT_FOUND'); }),
}));

describe('Vista de administración de cursos', () => {
    beforeEach(() => jest.clearAllMocks());

    it('muestra 404 cuando el curso no existe', async () => {
        jest.mocked(getCourseDataById).mockResolvedValue({
            ok: false,
            error: { code: 'NOT_FOUND', message: 'El curso no existe.' },
        });

        await expect(PreviewCoursePage({ params: Promise.resolve({ id: '5' }) })).rejects.toThrow('NEXT_NOT_FOUND');
        expect(notFound).toHaveBeenCalledTimes(1);
        expect(safeLogger.debug).toHaveBeenCalledWith('course.editor.view.rejected', {
            courseId: 5,
            code: 'NOT_FOUND',
        });
    });

    it('no oculta una falla de lectura como 404', async () => {
        jest.mocked(getCourseDataById).mockResolvedValue({
            ok: false,
            error: { code: 'UNEXPECTED', message: 'No fue posible consultar el curso.' },
        });

        await expect(PreviewCoursePage({ params: Promise.resolve({ id: '5' }) }))
            .rejects.toThrow('No fue posible cargar la vista del curso.');
        expect(notFound).not.toHaveBeenCalled();
        expect(safeLogger.debug).toHaveBeenCalledWith('course.editor.view.rejected', {
            courseId: 5,
            code: 'UNEXPECTED',
        });
    });
});
