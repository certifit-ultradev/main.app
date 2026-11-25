import { getCourseDataById } from "@/actions/courses/list";
import { AdminCourseView } from "@/components/course/admin/course-view";
import { safeLogger } from "@/shared/observability/safe-logger";
import { notFound } from "next/navigation";

interface PreviewCoursePageProps {
    params: Promise<{ id: string }>;
}

const PreviewCoursePage = async ({ params }: PreviewCoursePageProps) => {
    const { id } = await params;
    const courseId = Number(id);

    const response = await getCourseDataById({ id: courseId });
    if (!response.ok) {
        safeLogger.debug('course.editor.view.rejected', {
            courseId: Number.isSafeInteger(courseId) ? courseId : undefined,
            code: response.error.code,
        });
        if (response.error.code === 'UNEXPECTED') {
            throw new Error('No fue posible cargar la vista del curso.');
        }
        notFound();
    }

    return (
        <AdminCourseView data={response.data} />
    );
}
export default PreviewCoursePage;
