import { Cart } from "./cart";
import { CourseCategory } from "./course-category";
import { CourseModules } from "./course-modules";
import { UserCourse } from "./user-course";
import { UserQuizState } from "./user-quiz-state";

export class Course {
	id?: number;
	title: string;
	canonicalId: string;
	description: string;
	courseImage: string;
	categoryId: number;
	isActive: boolean;
	price: number;
	instructorName: string;
	instructorPhoto: string;
	deleted: boolean;
	expiresAt: Date;
	createdAt: Date;
	updatedAt: Date | null;
	category: CourseCategory | null;
	courseModules: CourseModules[] | null;
	userCourse: UserCourse[] | null;
	cart: Cart | null;
	constructor(init?: Partial<Course>) {
		Object.assign(this, init);
	}
} 
