import { Cart } from "./cart-course"

export class Purchase {
	id?: number;
	cartId: number;
	trxId: string;
	reference: string;
	paymentMethod: string;
	trxCreationDate: Date;
	total: number;
	subtotal: number;
	status: string;
	createdAt?: Date;
	updatedAt?: Date | null;
	deletedAt?: Date | null;
	cart?: Cart;

	constructor(
		data : {
			id?: number;
			cartId: number;
			trxId: string;
			reference: string;
			paymentMethod: string;
			trxCreationDate: Date;
			total: number;
			subtotal: number;
			status: string;
			createdAt?: Date;
			updatedAt?: Date | null;
			deletedAt?: Date | null;
			cart?: Cart;
		}
	) {
		this.id = data.id;
		this.cartId = data.cartId;
		this.trxId = data.trxId;
		this.reference = data.reference;
		this.paymentMethod = data.paymentMethod;
		this.trxCreationDate = data.trxCreationDate;
		this.total = data.total;
		this.subtotal = data.subtotal;
		this.status = data.status;
		this.createdAt = data.createdAt || new Date();
		this.updatedAt = data.updatedAt || null;
		this.deletedAt = data.deletedAt || null;
		this.cart = data.cart;
	}
}
