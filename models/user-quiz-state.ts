import { Course } from "./course"
import { CourseModules } from "./course-modules"
import { ModuleQuiz } from "./module-quiz"
import { UserCourse } from "./user-course"

export class UserQuizState {
	id?: number;
	quizId: number;
	userCourseId: number;
	courseModuleId: number;
	retries: number;
	result: number;
	passed: boolean;
	createdAt: Date;
	updatedAt: Date | null;
	course?: Course | null;
	courseModule?: CourseModules | null;
	moduleQuiz?: ModuleQuiz | null;
	userCourse?: UserCourse | null;

	constructor(
		data: {
			id?: number;
			quizId: number;
			userCourseId: number;
			courseModuleId: number;
			retries: number;
			result: number;
			passed: boolean;
			createdAt?: Date;
			updatedAt?: Date | null;
			course?: Course | null;
			courseModule?: CourseModules | null;
			moduleQuiz?: ModuleQuiz | null;
			userCourse?: UserCourse | null;
		}
	) {
		this.id = data.id || undefined;
		this.quizId = data.quizId;
		this.userCourseId = data.userCourseId;
		this.courseModuleId = data.courseModuleId;
		this.retries = data.retries || 0;
		this.result = data.result || 0;
		this.passed = data.passed || false;
		this.createdAt = data.createdAt || new Date();
		this.updatedAt = data.updatedAt || null;

		this.course = data.course || null;
		this.courseModule = data.courseModule || null;
		this.moduleQuiz = data.moduleQuiz || null;
		this.userCourse = data.userCourse || null;
	}
} 
