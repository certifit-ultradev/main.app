export class VerificationToken {
	id?: string
	email: string
	token: string
	expires: Date
	constructor(
		data: {
			id?: string,
			email: string,
			token: string,
			expires: Date
		}
	) {
		this.id = data.id
		this.email = data.email
		this.token = data.token
		this.expires = data.expires
	}
} 
