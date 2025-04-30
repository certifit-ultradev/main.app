import { PossibleAnswerQuestion } from "./possible-answer-question";

export class QuizQuestion {
	id?: number;
	quizId: number;
	title: string;
	type: string;
	points: number;
	createdAt?: Date;
	updatedAt?: Date | null;
	possibleAnswerQuestion?: PossibleAnswerQuestion[] | null;

	constructor(
		data: {
			id?: number;
			quizId: number;
			title: string;
			type: string;
			points: number;
			createdAt?: Date;
			updatedAt?: Date | null;
			possibleAnswerQuestion?: PossibleAnswerQuestion[] | null;
		}
	) {
		this.id = data.id;
		this.quizId = data.quizId;
		this.title = data.title;
		this.type = data.type;
		this.points = data.points;
		this.createdAt = data.createdAt || new Date();
		this.updatedAt = data.updatedAt || null;
		this.possibleAnswerQuestion = data.possibleAnswerQuestion || null;
	}
} 
