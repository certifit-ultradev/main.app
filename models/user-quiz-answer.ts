import { UserCourse } from "./user-course"

export class UserQuizAnswer {
	id?: number
	userCourseId: number
	quizId: number
	questionId: number
	answer: string
	correct: string
	isCorrect: boolean
	points: number
	createdAt: Date
	updatedAt: Date | null
	userCourse: UserCourse[] | null;
	constructor(init?: Partial<UserQuizAnswer>) {
		Object.assign(this, init);
	}
} 
