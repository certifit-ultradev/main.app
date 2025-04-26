import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { getTopThreeCourses } from '@/services/courses';

export async function GET() {
    try {
        const activeCourses = await getTopThreeCourses();
        return Response.json(activeCourses.map((course) => {
            return {
                canonicalId: course.canonicalId,
                title: course.title,
                description: course.description,
                courseImage: course.courseImage,
                courseDuration: course.courseDuration,
                instructorName: course.instructorName,
                instructorPhoto: course.instructorPhoto,
                expiresAt: new Date(course.expiresAt).toISOString().split('T')[0],
                category: course.category,
                price: course.price,
                alreadyPurchased: course.alreadyPurchased
            }
        }));
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
}