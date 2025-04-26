import { getCourseDataById } from "@/actions/courses/list";
import { AdminCourseView } from "@/components/course/admin/course-view";
import { notFound } from "next/navigation";

type PreviewCourseProps = {
    params: {
        id: string;
    }
};

const PreviewCoursePage = async ({ params }: PreviewCourseProps) => {
    const { id } = await params;

    const response = await getCourseDataById({ data: { id: Number(id) } });
    if (!response.success && !response.payload) {
        notFound(); // Si no se encuentra el usuario, muestra una página 404
    }

    return (
        <AdminCourseView data={response.payload} />
    );
}
export default PreviewCoursePage;