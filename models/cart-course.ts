export class Cart {
	id?: number;
	userId: string;
	courseId: number;
	createdAt: Date;
	updatedAt?: Date | null;
	deletedAt?: Date | null;

	constructor(
		data: {
			id: number,
			cartId: number,
			userId: string,
			courseId: number,
			createdAt: Date,
			updatedAt?: Date | null,
			deletedAt?: Date | null,
		}
	) {
		this.id = data.id;
		this.userId = data.userId;
		this.courseId = data.courseId;
		this.createdAt = data.createdAt || new Date();
		this.updatedAt = data.updatedAt || null;
		this.deletedAt = data.deletedAt || null;
	}
}
