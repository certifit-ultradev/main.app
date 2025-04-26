import { dispatchEmailRequestCourse } from "@/repository/nodemailer";
import { RequestCourseData } from "@/utils/types";

export const sendEmailCourseRequestInfo = async (data: RequestCourseData) => {
    await dispatchEmailRequestCourse(data);
}