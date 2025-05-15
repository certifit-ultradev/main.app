import { getCourseDataById } from "@/actions/courses/list";
import { AdminCourseView } from "@/components/course/admin/course-view";
import { CourseData } from "@/utils/types";
import { notFound } from "next/navigation";

// @ts-expect-error: params
const PreviewCoursePage = async ({ params }) => { 
    const { id } = await params;

    const response = await getCourseDataById({ data: { id: Number(id) } });
    if (!response.success && !response.payload) {
        notFound(); // Si no se encuentra el usuario, muestra una página 404
    }

    return (
        <AdminCourseView data={response.payload as CourseData} />
    );
}
export default PreviewCoursePage;