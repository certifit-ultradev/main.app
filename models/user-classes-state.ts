export class UserClassesState {
	id?: number;
	userCourseId: number;
	classId: number;
	currentVideoTime: number;
	completed: boolean;
	createdAt?: Date;
	updatedAt?: Date | null;

	constructor(
		data: {
			id?: number,
			userCourseId: number,
			classId: number,
			currentVideoTime: number,
			completed: boolean,
			createdAt?: Date,
			updatedAt?: Date | null,
		},
	) {
		this.id = data.id;
		this.userCourseId = data.userCourseId;
		this.classId = data.classId;
		this.currentVideoTime = data.currentVideoTime;
		this.completed = data.completed;
		this.createdAt = data.createdAt || new Date();
		this.updatedAt = data.updatedAt || null;
	}
}
