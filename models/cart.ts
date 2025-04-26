import { Course } from "./course"
import { Purchase } from "./purchase"
import { User } from "./user"

export class Cart {
	id: number
	userId: number
	courseId: number
	createdAt: Date
	updatedAt: Date | null
	user: User | null
	course: Course | null
	purchase: Purchase[] | null
	constructor(init?: Partial<Cart>) {
		Object.assign(this, init);
	}
}
