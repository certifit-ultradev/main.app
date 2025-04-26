import { Cart } from "./cart"

export class Purchase {
	id: number;
	cartId: number;
	trxId: string;
	reference: string;
	paymentMethod: string;
	trxCreationDate: Date;
	total: number;
	subtotal: number;
	status: string;
	createdAt: Date;
	updatedAt: Date | null;
	deletedAt: Date | null;
	cart: Cart | null;
	constructor(init?: Partial<Purchase>) {
		Object.assign(this, init);
	}
}
