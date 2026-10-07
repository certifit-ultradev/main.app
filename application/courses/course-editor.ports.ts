import type { CourseEditorPatch, CreateCourseCommand } from './course-editor.commands';

export interface CourseEditorWritePort {
    createCourse(command: CreateCourseCommand): Promise<number>;
    setCourseActive(courseId: number, isActive: boolean): Promise<boolean>;
    setClassVideo(classId: number, videoPath: string, videoSize: number): Promise<boolean>;
    updateCourse(courseId: number, patch: CourseEditorPatch): Promise<void>;
}
