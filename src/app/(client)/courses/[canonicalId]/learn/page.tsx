
import { ClientCourseView } from "@/components/course/client/course-view";
import { CourseNotPurchasedError } from "@/exceptions/course-not-purchased";
import { NotFoundError } from "@/exceptions/not-found";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

// @ts-expect-error: params
const LearnPage = async ({ params }) => {
    const { canonicalId } = await params;
    const rqHeaders = await headers();
    const response = await fetch(
        process.env.NEXT_PUBLIC_APP_URL + `/api/courses/${canonicalId}`,
        { method: 'GET', headers: new Headers(rqHeaders) }
    );

    let courseData = null;
    try {
        courseData = await response.json();
        if (!response.ok) {
            switch (response.status) {
                case 404:
                    throw new NotFoundError(courseData.message);
                case 400:
                    throw new CourseNotPurchasedError(courseData.message);
                default:
                    throw new Error(`Error inesperado: ${response.statusText}`);
            }
        }
    } catch (e) {
        if (e && typeof e === 'object') {
            switch (e.constructor) {
                case CourseNotPurchasedError:
                    throw new Error((e as CourseNotPurchasedError).cause);
                case Error:
                    throw e;
                case NotFoundError:
                    notFound();
                default:
                    throw new Error(`${e}, intente mas tarde`);
            }
        }

    }

    return (
        <ClientCourseView data={courseData} />
    );
}

export default LearnPage;