import { Course } from './course'
import { Cart } from './cart'

export class CartCourse {
	id: number

	cartId: number

	courseId: number

	createdAt: Date

	updatedAt: Date

	deletedAt: Date

	course: Course

	cart: Cart
}
