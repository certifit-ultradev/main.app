export class Instructor {
	id: number;
	name: string;
	lastName: string;
	createdAt?: Date;
	updatedAt?: Date | null;
	deletedAt: Date;

	constructor(
		data: {
			id: number,
			name: string,
			lastName: string,
			createdAt: Date,
			updatedAt?: Date,
			deletedAt: Date
		}
	) {
		this.id = data.id;
		this.name = data.name;
		this.lastName = data.lastName;
		this.createdAt = data.createdAt || new Date();
		this.updatedAt = data.updatedAt || null;
		this.deletedAt = data.deletedAt;
	}
}
