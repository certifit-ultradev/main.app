
import { ClientCourseView } from "@/components/course/client/course-view";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

const LearnPage = async ({ params }) => {
    const { canonicalId } = await params;
    const response = await fetch(
        process.env.NEXT_PUBLIC_APP_URL + `/api/courses/${canonicalId}`,
        { method: 'GET', headers: await headers() }
    );

    let courseData = null;
    try {
        courseData = await response.json();
    } catch (e) {
        console.error(e);
        notFound();
    }

    return (
        <ClientCourseView data={courseData} />
    );
}

export default LearnPage;