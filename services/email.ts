import type { CourseInformationRequestEmailCommand } from '@/application/notifications/email.ports';
import { nodemailerEmailGateway } from '@/infrastructure/notifications/nodemailer-email-gateway';

/**
 * 
 * @param data 
 * @returns 
 */
export const sendEmailCourseRequestInfo = async (data: CourseInformationRequestEmailCommand): Promise<void> => {
    await nodemailerEmailGateway.sendCourseInformationRequest(data);
}
