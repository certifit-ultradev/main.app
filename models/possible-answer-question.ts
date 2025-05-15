export class PossibleAnswerQuestion {
	id?: number;
	questionId: number;
	value: string;
	isCorrect: boolean;
	createdAt?: Date;
	updatedAt?: Date | null;

	constructor(
		data: {
			id?: number,
			questionId: number,
			value: string,
			isCorrect: boolean,
			createdAt?: Date,
			updatedAt?: Date | null
		}
	) {
		this.questionId = data.questionId;
		this.value = data.value;
		this.isCorrect = data.isCorrect;
		this.createdAt = data.createdAt || new Date();
		this.updatedAt = data.updatedAt || null;
		this.id = data.id || undefined;
	}
} 
