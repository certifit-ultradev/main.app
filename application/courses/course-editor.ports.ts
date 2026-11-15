import type { CourseBasicsCommand, CourseBasicsPatchCommand, CourseContentCommand, CourseEditorPatch, CreateCourseCommand } from './course-editor.commands';

export interface CourseEditorWritePort {
    createDraft(command: CourseBasicsCommand): Promise<number>;
    updateBasics(courseId: number, command: CourseBasicsPatchCommand): Promise<void>;
    saveContent(courseId: number, command: CourseContentCommand): Promise<void>;
    queueUnusedAssets(courseId: number, urls: string[]): Promise<void>;
    createCourse(command: CreateCourseCommand): Promise<number>;
    setCourseActive(courseId: number, isActive: boolean): Promise<boolean>;
    setClassVideo(classId: number, videoPath: string, videoSize: number): Promise<boolean>;
    updateCourse(courseId: number, patch: CourseEditorPatch): Promise<void>;
}
