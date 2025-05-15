import { dispatchEmailRequestCourse } from "@/repository/nodemailer";
import { RequestCourseData } from "@/utils/types";

/**
 * 
 * @param data 
 * @returns 
 */
export const sendEmailCourseRequestInfo = async (data: RequestCourseData) => {
    await dispatchEmailRequestCourse(data);
}