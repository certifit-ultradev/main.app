import { CourseModule } from "./types";

export const calculateTotalVideoSize = (modules: CourseModule[]) => {
    return (modules?.reduce((total, module) => {
        return total + module.classes!.reduce((classTotal, cls) => {
            let videoSize: number = 0;
            if (cls.video instanceof File) {
                videoSize = cls.video.size;
            } else {
                videoSize = cls.videoSize ?? 0;
            }
            return classTotal + videoSize;
        }, 0);
    }, 0));
};

export const formatVideoSize = (size: number): string => {
    return (size / (1024 * 1024 * 1024)).toFixed(4);
}

export const calculateTotalVideoDuration = (modules: CourseModule[]) => {
    return (modules?.reduce((total, module) => {
        return total + module.classes!.reduce((classTotal, cls) => {
            return classTotal + (cls.videoDuration ?? 0);
        }, 0);
    }, 0));
}

export const formatVideoDuration = (duration: number): string => {
    // Redondeamos o hacemos floor de los segundos
    const totalSeconds = Math.floor(duration);

    // Calculamos horas, minutos y segundos
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Formateamos con cero a la izquierda (e.g. 09)
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');

    return `${hh} hr ${mm} mins ${ss} sec`;
}