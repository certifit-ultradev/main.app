import { ReactNode } from "react"

export type RegisterUser = {
    name: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    password: string,
    confirmPassword: string,
    checkTerms: boolean
}

export interface RegisterUserFirstStep {
    name: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    checkTerms: boolean,
}

export type UpdateUser = {
    name: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    password: string
}

export type OtpCreationResult = {
    success: boolean,
    status: string,
    status_description: string,
    attemps?: number
}

export type OtpVerificationResult = {
    success: boolean,
    status: string,
    status_description: string
}

export type OtpValidationResult = {
    success: boolean,
    status: string,
    status_description: string
}

export interface VerificationTokenResult {
    success: boolean,
    message: string
}

export interface ResetPasswordTokenResult {
    success: boolean,
    message: string
}

export type LoginForm = {
    email: string,
    password: string
}

export type ServerActionResponse<T> = {
    success?: boolean,
    message?: string,
    payload?: T,
    error?: string
}

export interface ServerActionRequest<T> {
    data: T;
}

export interface FetchCategory {
    id: number
}

export interface FetchUserByEmail {
    email: string
}

export interface FetchUserByID {
    id: string
}

export interface FetchCourseByID {
    id: number
}

export interface ActivateOrDeactivateCourse {
    id: number
}

export interface FetchPage {
    page: number;
}

export type ApiResponse<T> = {
    success?: boolean,
    message?: string,
    data?: T,
    error?: string
}

export type CreateOtpVerification = {
    sid: string,
    value: string,
    attempts: number,
    type: string,
    status: string
}

export interface CourseTable {
    title: string,
    description: string,
    isActive: boolean,
}

export interface ProviderProps {
    children: ReactNode
}

export interface LoggedUser {
    name: string,
    lastName: string,
    isCustomer: boolean
}

export interface AuthInterface {
    isAuthenticated: boolean
    setAuthenticated: (value: boolean) => void
    refreshAuthContext: () => void
    logout: () => void
}

export interface RegisterPageData {
    name: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
    checkTerms: boolean;
};

export interface CourseList {
    id?: number;
    title: string;
    isActive: boolean;
}

export interface UserList {
    id?: string;
    name: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    isAdmin: boolean;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date | null;
}

export interface UserCreateData {
    id?: string;
    name: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
}

export interface DataPaginated<T> {
    data: T[]
    page: number
    lastPage: number
    total: number
}

export interface RequestDataPaginated {
    page: number
}

export interface CoursePlainData {
    id?: number;
    canonicalId: string;
    title: string;
    price: number;
    courseImage: any;
    instructorName: string;
    instructorPhoto: any;
    courseDuration: string;
    category: CourseCategoryData;
    description: string;
    alreadyPurchased: boolean;
    expiresAt: Date;
}

export interface ClassProgress {
    id: number,
    name: string,
    completed: boolean
}

export interface CoursePublicData {
    canonicalId: string;
    title: string;
    price: number;
    courseImage: any;
    instructorName: string;
    instructorPhoto: any;
    courseDuration?: string;
    category: CourseCategoryData;
    description: string;
    expiresAt: string;
    classViewed: ClassViewed[];
    moduleViewed: ModuleViewed[];
    modules: CourseModule[] | undefined;
    classesWithCompletion: ClassProgress[],
    classCompleted: ClassCompleted[],
    moduleCompleted: ModuleCompleted[],
    quizCompleted: QuizCompleted[],
    progressPercent: number,
    currentIndex: number,
    totalClasses: number,
    visibleClasses: any
}

export interface RemapedCourse {
    canonicalId: string;
    title: string;
    price: number;
    courseImage: any;
    instructorName?: string;
    instructorPhoto: any;
    courseDuration?: string;
    category: CourseCategoryData;
    description: string;
    expiresAt?: Date;
    classViewed?: ClassViewed[] | null;
    moduleViewed?: ModuleViewed[] | null;
    modules: CourseModule[] | undefined;
}

export interface ClassCompleted {
    classId: number,
    currentVideoTime: number,
    isCompleted: boolean,
    createdAt: Date
}

export interface ModuleCompleted {
    moduleId: number;
    isCompleted: boolean;
    createdAt: Date;
}

export interface QuizCompleted {
    quizId: number,
    courseModuleId: number,
    result: number,
    retries: number,
    passed: boolean,
    createdAt: Date
}

export interface ClassViewed {
    classId: number,
    currentVideoTime: number,
    completed: boolean
}

export interface ModuleViewed {
    moduleId: number,
    completed: boolean
}

export interface CourseData {
    id?: number;
    title: string;
    price: number;
    courseImage: any;
    instructorName: string;
    instructorPhoto: any;
    category: CourseCategoryData;
    description: string;
    expiresAt: string;
    modules: CourseModule[] | undefined;
}

export interface CourseModule {
    id?: number;
    courseId?: number;
    minRequiredPoints: number;
    title: string;
    classes: ModuleClass[] | undefined;
    quiz: QuizModule | undefined;
};

export interface ModuleClass {
    id?: number;
    courseModuleId?: number;
    title: string;
    description: string;
    video?: any;
    videoSize?: number;
    videoDuration?: number;
}

export interface QuizModule {
    id?: number;
    courseModuleId?: number;
    title: string;
    description: string;
    questions: QuizQuestions[] | undefined;
}

export interface CurrentUserQuizState {
    retries: number
    result: number
    passed: boolean
}

export interface RemapedClass {
    id?: number,
    title?: string,
    completed: boolean
}

export interface QuizQuestions {
    id?: number;
    quizModuleId?: number;
    type: string;
    title: string;
    points: number;
    options: QuestionOption[] | undefined;
}

export interface QuestionOption {
    id?: number;
    quizQuestionId?: number;
    value: string,
    isCorrect: boolean
}

export interface CourseCategoryData {
    id?: number
    name: string
}

export interface CreateQuestionAnswer {
    canonicalId: string
    moduleId: number
    questionId: number
    quizId: number
    optionId: number
    answer?: string
}

export interface CalculateQuizScore {
    canonicalId: string
    moduleId: number
    quizId: number
}

export interface ResultQuizScore {
    questionCount: number
    totalScore: number
    pass: boolean
}

export interface ResultSalesCourse {
    courseName: string
    total: number
}

export interface TransactionEventUpdate {
    id: string
    createdAt: Date
    finalizeddAt: Date
    amountInCents: number
    status: string
    reference: string
    customerEmail: string
    currency: string
    paymentMethodType: string
    paymentMethod: string
    redirectUrl: string
    paymentLinkId: string
}

export interface SendVerificationToken {
    email: string
}

export interface EditCourseData {
    originalCourseData: CourseData
    newCourseData: CourseData
}

export interface EditClassVideo {
    clsId: number
    videoPath: string
    videoSize: number
}

export interface EditUserData {
    id: string
    userData: Partial<UserCreateData>
}

export interface UsersMonthResult {
    currentMonthCount: number;
    previousMonthCount: number;
}

export interface CoursesMonthResult {
    currentMonthCount: number;
    previousMonthCount: number;
}

export interface PorcentialVariation {
    percentage: number;
    arrowDirection: string;
}

export interface CountVariation {
    count: number;
    arrowDirection: string;
}

export interface RequestCourseData {
    canonicalId: string,
    nombre: string,
    empresa: string,
    email: string,
    telefono: string,
    curso: string,
    detalles: string,
    terminos: boolean,
}