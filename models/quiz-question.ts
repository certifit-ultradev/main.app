import { PossibleAnswerQuestion } from "./possible-answer-question";

export class QuizQuestion {
	id: number;
	quizId: number;
	title: string;
	type: string;
	points: number;
	createdAt: Date;
	updatedAt: Date | null;
	possibleAnswerQuestion: PossibleAnswerQuestion[] | null;
	constructor(init?: Partial<QuizQuestion>) {
		Object.assign(this, init);
	}
} 
