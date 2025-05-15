import { Course } from "./course"
import { User } from "./user"
import { UserClassesState } from "./user-classes-state"
import { UserQuizAnswer } from "./user-quiz-answer";
import { UserQuizState } from "./user-quiz-state";
import { UserModuleState } from "./user_module_state"

export class UserCourse {
	id?: number;
	userId: string;
	courseId: number;
	completedAt: Date | null;
	createdAt?: Date;
	updatedAt?: Date | null;
	user?: User | null;
	course?: Course | null;
	userClassesState?: UserClassesState[];
	userModuleState?: UserModuleState[];
	userQuizAnswer?: UserQuizAnswer[];
	userQuizState?: UserQuizState[];

	constructor(
		data: {
			id?: number;
			userId: string;
			courseId: number;
			completedAt: Date | null;
			createdAt?: Date;
			updatedAt?: Date | null;
			user?: User | null;
			course?: Course | null;
			userClassesState?: UserClassesState[];
			userModuleState?: UserModuleState[];
			userQuizAnswer?: UserQuizAnswer[];
			userQuizState?: UserQuizState[];
		}
	) {
		this.id = data.id;
		this.userId = data.userId;
		this.courseId = data.courseId;
		this.completedAt = data.completedAt || null;
		this.createdAt = data.createdAt || new Date();
		this.updatedAt = data.updatedAt || null;
		this.user = data.user || null;
		this.course = data.course || null;
		this.userClassesState = data.userClassesState;
		this.userModuleState = data.userModuleState;
		this.userQuizAnswer = data.userQuizAnswer;
		this.userQuizState = data.userQuizState;
	}
} 
