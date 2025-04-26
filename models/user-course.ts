import { Course } from "./course"
import { User } from "./user"
import { UserClassesState } from "./user-classes-state"
import { UserQuizAnswer } from "./user-quiz-answer";
import { UserQuizState } from "./user-quiz-state";
import { UserModuleState } from "./user_module_state"

export class UserCourse {
	id: number;
	userId: string;
	courseId: number;
	completedAt: Date | null;
	createdAt: Date;
	updatedAt: Date | null;
	user?: User | null;
	course?: Course | null;
	userClassesState?: UserClassesState[] | null;
	userModuleState?: UserModuleState[] | null;
	userQuizAnswer?: UserQuizAnswer[] | null;
	userQuizState?: UserQuizState[] | null;
	constructor(init?: Partial<UserCourse>) {
		Object.assign(this, init);
	}
} 
