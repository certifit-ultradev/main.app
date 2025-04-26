import { User as _User } from './user'
import { Account as _Account } from './account'
import { VerificationToken as _VerificationToken } from './verification_token'
import { PasswordResetToken as _PasswordResetToken } from './password_reset_token'
import { Instructor as _Instructor } from './instructor'
import { Course as _Course } from './course'
import { CourseModules as _CourseModules } from './course_modules'
import { ModuleClass as _ModuleClass } from './module_class'
import { ModuleQuiz as _ModuleQuiz } from './module_quiz'
import { QuizQuestion as _QuizQuestion } from './quiz_question'
import { PossibleAnswerQuestion as _PossibleAnswerQuestion } from './possible_answer_question'
import { UserCourse as _UserCourse } from './user_course'
import { Cart as _Cart } from './cart'
import { CartCourse as _CartCourse } from './cart_course'
import { Purchase as _Purchase } from './purchase'
import { UserModuleState as _UserModuleState } from './user_module_state'
import { UserClassesState as _UserClassesState } from './user_classes_state'
import { UserQuizAnswer as _UserQuizAnswer } from './user_quiz_answer'

export namespace PrismaModel {
	export class User extends _User {}
	export class Account extends _Account {}
	export class VerificationToken extends _VerificationToken {}
	export class PasswordResetToken extends _PasswordResetToken {}
	export class Instructor extends _Instructor {}
	export class Course extends _Course {}
	export class CourseModules extends _CourseModules {}
	export class ModuleClass extends _ModuleClass {}
	export class ModuleQuiz extends _ModuleQuiz {}
	export class QuizQuestion extends _QuizQuestion {}
	export class PossibleAnswerQuestion extends _PossibleAnswerQuestion {}
	export class UserCourse extends _UserCourse {}
	export class Cart extends _Cart {}
	export class CartCourse extends _CartCourse {}
	export class Purchase extends _Purchase {}
	export class UserModuleState extends _UserModuleState {}
	export class UserClassesState extends _UserClassesState {}
	export class UserQuizAnswer extends _UserQuizAnswer {}

	export const extraModels = [
		User,
		Account,
		VerificationToken,
		PasswordResetToken,
		Instructor,
		Course,
		CourseModules,
		ModuleClass,
		ModuleQuiz,
		QuizQuestion,
		PossibleAnswerQuestion,
		UserCourse,
		Cart,
		CartCourse,
		Purchase,
		UserModuleState,
		UserClassesState,
		UserQuizAnswer,
	]
}
