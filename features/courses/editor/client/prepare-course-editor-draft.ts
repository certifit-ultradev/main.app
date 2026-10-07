import {
    toPersistableCourseEditorDraft,
    type CourseEditorFormValues,
    type PersistableCourseEditorDraft,
} from '../course-editor-form.types';
import { uploadEditorAsset } from './blob-assets';

type UploadAsset = typeof uploadEditorAsset;

/** Uploads browser assets and strips local-only editor state before the server action. */
export async function prepareCourseEditorDraftForAction(
    course: CourseEditorFormValues,
    uploadPath: string,
    uploadAsset: UploadAsset = uploadEditorAsset,
): Promise<PersistableCourseEditorDraft> {
    const draft: CourseEditorFormValues = {
        ...course,
        modules: course.modules.map((module) => ({
            ...module,
            classes: module.classes.map((courseClass) => ({
                ...courseClass,
                // Videos are uploaded after class IDs are available.
                video: courseClass.video instanceof File ? null : courseClass.video,
            })),
            quiz: {
                ...module.quiz,
                questions: module.quiz.questions.map((question) => question.type === 'text'
                    ? { ...question, expectedAnswer: { ...question.expectedAnswer } }
                    : { ...question, options: question.options.map((option) => ({ ...option })) }),
            },
        })),
    };

    if (draft.courseImage instanceof File) {
        draft.courseImage = (await uploadAsset(uploadPath, draft.courseImage)).url;
    }
    if (draft.instructorPhoto instanceof File) {
        draft.instructorPhoto = (await uploadAsset(uploadPath, draft.instructorPhoto)).url;
    }

    return toPersistableCourseEditorDraft(draft);
}
