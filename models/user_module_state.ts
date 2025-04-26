import { UserCourse } from './user_course'
import { CourseModules } from './course_modules'

export class UserModuleState {
	id?: number;
	userCourseId: number;
	moduleId: number;
	completed: boolean;
	createdAt: Date;
	updatedAt: Date | null;
	userCourse?: UserCourse | null;
	courseModule?: CourseModules | null;
	constructor(init?: Partial<UserModuleState>) {
		Object.assign(this, init);
	}
}
