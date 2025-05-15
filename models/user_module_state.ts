import { UserCourse } from './user-course'
import { CourseModules } from './course-modules'

export class UserModuleState {
	id?: number;
	userCourseId: number;
	moduleId: number;
	completed: boolean;
	createdAt?: Date;
	updatedAt?: Date | null;
	userCourse?: UserCourse | null;
	courseModule?: CourseModules | null;

	constructor(
		data: {
			id?: number,
			userCourseId: number,
			moduleId: number,
			completed: boolean,
			createdAt?: Date,
			updatedAt?: Date | null,
			userCourse?: UserCourse | null,
			courseModule?: CourseModules | null,
		}
	) {
		this.id = data.id;
		this.userCourseId = data.userCourseId;
		this.moduleId = data.moduleId;
		this.completed = data.completed;
		this.createdAt = data.createdAt || new Date();
		this.updatedAt = data.updatedAt || null;
		this.userCourse = data.userCourse || null;
		this.courseModule = data.courseModule || null;
	}
}
