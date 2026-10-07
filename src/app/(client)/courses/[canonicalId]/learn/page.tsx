
import { ClientCourseView } from "@/components/course/client/course-view";
import { getPublicAppUrl } from "@/config/env";
import { CourseParamsSchema } from "@/interfaces/http/courses/params.contract";
import { parseStudentCourseResponse, StudentCourseHttpError } from "@/features/courses/learning/student-course-api";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

type LearnPageProps = {
    params: Promise<{ canonicalId: string }>;
};

const LearnPage = async ({ params }: LearnPageProps) => {
    const parsedParams = CourseParamsSchema.safeParse(await params);
    if (!parsedParams.success) notFound();

    const { canonicalId } = parsedParams.data;
    const rqHeaders = await headers();
    const response = await fetch(
        `${getPublicAppUrl()}/api/courses/${encodeURIComponent(canonicalId)}`,
        { method: 'GET', headers: new Headers(rqHeaders) }
    );

    let courseData;
    try {
        courseData = await parseStudentCourseResponse(response);
    } catch (error) {
        if (error instanceof StudentCourseHttpError) {
            if (error.status === 401) {
                redirect(`/login?callbackUrl=${encodeURIComponent(`/courses/${canonicalId}/learn`)}`);
            }

            // Do not disclose whether a course exists to an unauthorised student.
            if (error.status === 403 || error.status === 404) {
                notFound();
            }
        }

        throw error;
    }

    return <ClientCourseView data={courseData} />;
}

export default LearnPage;
