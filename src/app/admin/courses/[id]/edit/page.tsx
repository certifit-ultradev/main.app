import { CourseEditorWizard } from '@/components/course/course-editor-wizard';

export default async function EditCoursesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <CourseEditorWizard courseId={Number(id)} />;
}
