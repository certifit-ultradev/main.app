export class UserModuleState {
	id: number
	userCourseId: number
	moduleId: number
	completed: boolean
	createdAt: Date
	updatedAt: Date
	constructor(
		data: {
			id: number,
			userCourseId: number,
			moduleId: number,
			completed: boolean,
			createdAt: Date,
			updatedAt: Date
		}
	) {
		this.id = data.id
		this.userCourseId = data.userCourseId
		this.moduleId = data.moduleId
		this.completed = data.completed
		this.createdAt = data.createdAt
		this.updatedAt = data.updatedAt
	}
}
