export class PossibleAnswerQuestion {
	id?: number
	questionId: number
	value: string
	isCorrect: boolean
	createdAt: Date
	updatedAt: Date | null
	constructor(init?: Partial<PossibleAnswerQuestion>) {
		Object.assign(this, init);
	}
} 
