export class CartCourse {
	id: number
	cartId: number
	courseId: number
	createdAt: Date
	updatedAt: Date
	deletedAt: Date
	constructor(
		data: {
			id: number,
			cartId: number,
			courseId: number,
			createdAt: Date,
			updatedAt: Date,
			deletedAt: Date
		}
	) {
		this.id = data.id
		this.cartId = data.cartId
		this.courseId = data.courseId
		this.createdAt = data.createdAt
		this.updatedAt = data.updatedAt
		this.deletedAt = data.deletedAt
	}
}
