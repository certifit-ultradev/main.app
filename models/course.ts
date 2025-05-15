import { Cart } from "./cart-course";
import { CourseCategory } from "./course-category";
import { CourseModules } from "./course-modules";
import { UserCourse } from "./user-course";

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
	updatedAt?: Date | null;
	category?: CourseCategory | null;
	courseModules?: CourseModules[] | null;
	userCourse?: UserCourse[] | null;
	cart?: Cart | null;

	constructor(
		data: {
			id?: number;
			title: string,
			canonicalId: string,
			description: string,
			courseImage: string,
			categoryId: number,
			isActive: boolean,
			price: number,
			instructorName: string,
			instructorPhoto: string,
			deleted: boolean,
			expiresAt: Date,
			createdAt: Date,
			updatedAt?: Date | null,
			category?: CourseCategory | null,
			courseModules?: CourseModules[] | null,
			userCourse?: UserCourse[] | null,
			cart?: Cart | null,
		}
	) {
		this.id = data.id;
		this.title = data.title;
		this.canonicalId = data.canonicalId;
		this.description = data.description;
		this.courseImage = data.courseImage;
		this.categoryId = data.categoryId;
		this.isActive = data.isActive;
		this.price = data.price;
		this.instructorName = data.instructorName;
		this.instructorPhoto = data.instructorPhoto;
		this.deleted = data.deleted;
		this.expiresAt = data.expiresAt;
		this.createdAt = data.createdAt;
		this.updatedAt = data.updatedAt || null;
		this.category = data.category || null;
		this.courseModules = data.courseModules || null;
		this.userCourse = data.userCourse || null;
		this.cart = data.cart || null;	
	}
} 
