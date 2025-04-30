export class UserModuleState {
	id: number;
	userCourseId: number;
	moduleId: number;
	completed: boolean;
	createdAt?: Date;
	updatedAt?: Date | null;

	constructor(
		data: {
			id: number,
			userCourseId: number,
			moduleId: number,
			completed: boolean,
			createdAt?: Date | null,
			updatedAt?: Date | null,
		}
	) {
		this.id = data.id;
		this.userCourseId = data.userCourseId;
		this.moduleId = data.moduleId;
		this.completed = data.completed;
		this.createdAt = data.createdAt || new Date();
		this.updatedAt = data.updatedAt || null;
	}
}
