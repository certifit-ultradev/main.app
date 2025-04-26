export class ModuleClass {
    id?: number;
    title: string;
    description: string;
    courseModuleId: number;
    videoPath: string;
    videoSize: number;
    videoDuration: number;
    createdAt: Date;
    updatedAt: Date | null;
    constructor(
        data: {
            id?: number;
            title: string;
            description: string,
            courseModuleId: number;
            videoPath: string;
            videoSize: number;
            videoDuration: number;
        }
    ) {
        this.id = data.id;
        this.title = data.title;
        this.description = data.description;
        this.courseModuleId = data.courseModuleId;
        this.videoPath = data.videoPath;
        this.videoSize = data.videoSize;
        this.videoDuration = data.videoDuration;
    }
} 
