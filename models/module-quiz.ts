import { QuizQuestion } from "./quiz-question"
import { UserQuizState } from "./user-quiz-state"

export class ModuleQuiz {
    id?: number
    title: string
    description: string
    courseModuleId: number
    createdAt: Date
    updatedAt: Date | null
    quizQuestion?: QuizQuestion[] | null;
    userQuizState?: UserQuizState[] | null;
    constructor(data: {
        id?: number,
        title: string,
        description: string,
        courseModuleId: number,
        quizQuestion?: QuizQuestion[]
        userQuizState?: UserQuizState[]
    }
    ) {
        this.id = data.id
        this.title = data.title
        this.description = data.description
        this.courseModuleId = data.courseModuleId
        this.quizQuestion = data.quizQuestion
        this.userQuizState = data.userQuizState
    }
}
