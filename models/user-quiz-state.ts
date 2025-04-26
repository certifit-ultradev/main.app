import { Course } from "./course"
import { CourseModules } from "./course-modules"
import { ModuleQuiz } from "./module-quiz"
import { UserCourse } from "./user-course"

export class UserQuizState {
	id?: number
	quizId: number
	userCourseId: number	
	courseModuleId: number
	retries: number
	result: number
	passed: boolean
	createdAt: Date
	updatedAt: Date | null;
	course: Course | null;
	courseModule: CourseModules | null;
	moduleQuiz:   ModuleQuiz | null;
	userCourse: UserCourse | null;
	constructor(init?: Partial<UserQuizState>) {
		Object.assign(this, init);
	}
} 
