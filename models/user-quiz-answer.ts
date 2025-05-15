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
	createdAt?: Date
	updatedAt?: Date | null
	userCourse?: UserCourse[] | null;

	constructor(
		data: {
			id?: number
			userCourseId: number
			quizId: number
			questionId: number
			answer: string
			correct: string
			isCorrect: boolean
			points: number
			createdAt?: Date
			updatedAt?: Date | null
			userCourse?: UserCourse[] | null
		}
	) {
		this.id = data.id
		this.userCourseId = data.userCourseId
		this.quizId = data.quizId
		this.questionId = data.questionId
		this.answer = data.answer
		this.correct = data.correct
		this.isCorrect = data.isCorrect
		this.points = data.points
		this.createdAt = data.createdAt || new Date()
		this.updatedAt = data.updatedAt || null
		this.userCourse = data.userCourse || null
	}
} 
