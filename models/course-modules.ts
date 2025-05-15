import { ModuleClass } from "./module-class"
import { ModuleQuiz } from "./module-quiz"

export class CourseModules {
	id?: number;
	courseId: number;
	title: string;
	minRequiredPoints: number;
	createdAt?: Date;
	updatedAt?: Date | null;
	moduleClass?: ModuleClass[] | null;
	moduleQuiz?: ModuleQuiz[] | null;

	constructor(
		data: {
			id?: number,
			courseId: number,
			title: string,
			minRequiredPoints: number,
			createdAt: Date,
			updatedAt?: Date | null,
			moduleClass?: ModuleClass[] | null,
			moduleQuiz?: ModuleQuiz[] | null,
		}
	) {
		this.courseId = data.courseId;
		this.title = data.title;
		this.minRequiredPoints = data.minRequiredPoints;
		this.createdAt = data.createdAt || new Date();
		this.updatedAt = data.updatedAt || null;
		this.moduleClass = data.moduleClass || null;
		this.moduleQuiz = data.moduleQuiz || null;
		this.id = data.id || undefined;
	}
}
