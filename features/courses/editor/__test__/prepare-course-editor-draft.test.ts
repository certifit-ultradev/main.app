import { prepareCourseEditorDraftForAction } from '@/features/courses/editor/client/prepare-course-editor-draft';
import type { CourseEditorFormValues } from '@/features/courses/editor/course-editor-form.types';
import { AdminCourseInputSchema } from '@/interfaces/actions/admin.contract';

describe('prepareCourseEditorDraftForAction', () => {
    it('uploads images, postpones video upload and preserves both question variants without mutation', async () => {
        const courseImage = new File(['course'], 'course.png', { type: 'image/png' });
        const teacherImage = new File(['teacher'], 'teacher.png', { type: 'image/png' });
        const video = new File(['video'], 'lesson.mp4', { type: 'video/mp4' });
        const form: CourseEditorFormValues = {
            title: 'Curso', price: 100, courseImage, instructorName: 'Ada', instructorPhoto: teacherImage,
            category: { id: 1, name: 'Tecnología' }, description: 'Descripción', expiresAt: '2030-01-01',
            modules: [{
                id: 2, clientKey: 'module-2', title: 'Módulo inicial', minRequiredPoints: 1,
                classes: [{ id: 3, clientKey: 'class-3', title: 'Clase', description: 'Descripción', video }],
                quiz: { id: 4, clientKey: 'quiz-4', title: 'Quiz', description: 'Evaluación', questions: [
                    { id: 5, clientKey: 'question-5', type: 'text', title: 'Explique', points: 1, expectedAnswer: { value: 'Respuesta' } },
                    { id: 7, clientKey: 'question-7', type: 'multiple', title: 'Elija', points: 1, options: [
                        { id: 8, clientKey: 'option-8', value: 'A', isCorrect: true },
                        { id: 9, clientKey: 'option-9', value: 'B', isCorrect: false },
                    ] },
                ] },
            }],
        };
        const uploadAsset = jest.fn(async (_path: string, file: File) => ({
            url: `https://example.com/${file.name}`, pathname: file.name,
        }));

        const draft = await prepareCourseEditorDraftForAction(form, '/courses/2/', uploadAsset);

        expect(uploadAsset).toHaveBeenCalledTimes(2);
        expect(uploadAsset).toHaveBeenNthCalledWith(1, '/courses/2/', courseImage);
        expect(uploadAsset).toHaveBeenNthCalledWith(2, '/courses/2/', teacherImage);
        expect(draft.courseImage).toBe('https://example.com/course.png');
        expect(draft.instructorPhoto).toBe('https://example.com/teacher.png');
        expect(draft.modules[0].classes[0].video).toBeNull();
        expect(form.modules[0].classes[0].video).toBe(video);
        expect(form.courseImage).toBe(courseImage);
        expect(draft.modules[0].quiz.questions).toEqual([
            { id: 5, type: 'text', title: 'Explique', points: 1, expectedAnswer: { value: 'Respuesta' } },
            { id: 7, type: 'multiple', title: 'Elija', points: 1, options: [
                { id: 8, value: 'A', isCorrect: true }, { id: 9, value: 'B', isCorrect: false },
            ] },
        ]);
        expect(JSON.stringify(draft)).not.toContain('clientKey');
        expect(AdminCourseInputSchema.safeParse(draft).success).toBe(true);
    });

    it('does not return a draft when an image upload fails', async () => {
        const form: CourseEditorFormValues = {
            title: 'Curso', price: 100,
            courseImage: new File(['course'], 'course.png', { type: 'image/png' }),
            instructorName: 'Ada', instructorPhoto: 'https://example.com/teacher.png',
            category: { id: 1, name: 'Tecnología' }, description: 'Descripción', expiresAt: '2030-01-01',
            modules: [],
        };
        const uploadAsset = jest.fn().mockRejectedValue(new Error('upload failed'));
        await expect(prepareCourseEditorDraftForAction(form, '/courses/pending/', uploadAsset)).rejects.toThrow('upload failed');
        expect(form.courseImage).toBeInstanceOf(File);
    });
});
