import type { CatalogCourseCardDto, CourseEditorDto } from './course.dto';
import type { StudentCourseDto, StudentCourseListItemDto } from './student-course.dto';

/**
 * Absence convention for read ports: a singular lookup returns `null` when
 * the requested resource is not present or not visible to the actor; a
 * plural lookup always returns an array. Persistence failures are rejected.
 */

export type CourseEditorListItemDto = {
    id: number;
    title: string;
    isActive: boolean;
};

export type CourseEditorPageDto = {
    data: CourseEditorListItemDto[];
    page: number;
    lastPage: number;
    total: number;
};

export interface CourseCatalogReadPort {
    findActiveCatalogCourses(viewerId?: string): Promise<CatalogCourseCardDto[]>;
}

export interface StudentCourseReadPort {
    findEnrolledCourse(canonicalId: string, studentId: string): Promise<StudentCourseDto | null>;
    findEnrolledCourses(studentId: string): Promise<StudentCourseListItemDto[]>;
}

export type StudentQuizAnswerDto = {
    questionId: number;
    answer: string;
};

export type StudentQuizAttemptDto = {
    quizId: number;
    courseModuleId: number;
    retries: number;
    result: number;
    passed: boolean;
};

export interface StudentQuizReadPort {
    findAnswers(canonicalId: string, studentId: string, quizId: number): Promise<StudentQuizAnswerDto[]>;
    findLatestAttempt(canonicalId: string, studentId: string, quizId: number): Promise<StudentQuizAttemptDto | null>;
}

export interface CourseEditorReadPort {
    findEditorCourseById(courseId: number): Promise<CourseEditorDto | null>;
    findEditorCoursePage(page: number, pageSize: number): Promise<CourseEditorPageDto>;
    countActiveCourses(): Promise<number>;
}
