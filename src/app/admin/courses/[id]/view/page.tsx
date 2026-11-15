import { getCourseDataById } from "@/actions/courses/list";
import { AdminCourseView } from "@/components/course/admin/course-view";
import { notFound } from "next/navigation";

interface PreviewCoursePageProps {
    params: Promise<{ id: string }>;
}

const PreviewCoursePage = async ({ params }: PreviewCoursePageProps) => {
    const { id } = await params;

    const response = await getCourseDataById({ id: Number(id) });
    if (!response.ok) {
        notFound(); // Si no se encuentra el usuario, muestra una página 404
    }

    return (
        <AdminCourseView data={response.data} />
    );
}
export default PreviewCoursePage;
