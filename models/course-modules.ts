import { ModuleClass } from "./module-class"
import { ModuleQuiz } from "./module-quiz"

export class CourseModules {
	id?: number
	courseId: number
	title: string
	minRequiredPoints: number
	createdAt: Date
	updatedAt: Date | null;
	moduleClass?: ModuleClass[] | null;
	moduleQuiz?: ModuleQuiz[] | null;
	constructor(init?: Partial<CourseModules>) {
		Object.assign(this, init);
	}
}
