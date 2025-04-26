export class UserClassesState {
	id?: number
	userCourseId: number
	classId: number
	currentVideoTime: number
	completed: boolean
	createdAt: Date
	updatedAt: Date | null
	constructor(init?: Partial<UserClassesState>) {
		Object.assign(this, init);
	}
}
