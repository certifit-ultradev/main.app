import { cn } from "@/lib/utils";
import { FormatListBulleted, VideoLibrary, ViewHeadline } from "@mui/icons-material";

type CourseStepProgressProp = {
    currentStep: number;
};

export const CourseStepProgress = ({ currentStep }: CourseStepProgressProp) => {
    const steps = ["Información Básica", "Clases", "Resumen"];

    return (
        <div className={cn('w-full lg:w-1/4 bg-[#F9FAFC] rounded-lg p-4 h-60')}>
            <nav className={cn('flex flex-col gap-4')}>
                {steps.map((step, index) => {
                    // Determinamos los colores basados en el estado del paso
                    let textColor = "";
                    let bgColor = "";
                    if (index < currentStep - 1) {
                        // Pasos completados
                        textColor = "text-[#999A9F]";
                        bgColor = "bg-[#CEF4D7]";
                    } else if (index === currentStep - 1) {
                        // Paso actual
                        textColor = "text-[#1E1E1E]";
                        bgColor = "bg-[#FFFFFF] shadow";
                    } else {
                        // Pasos futuros
                        textColor = "text-[#999A9F]";
                        bgColor = "bg-[#E5E7E8]";
                    }

                    return (
                        <div
                            key={index}
                            className={cn(`flex items-center gap-2 text-lg font-medium cursor-pointer ${textColor}`)}
                        >
                            <div
                                className={cn(`rounded-lg flex items-center justify-center w-10 h-10 ${bgColor}`)}
                            >
                                {index === 0 ? (
                                    <ViewHeadline className={cn('invert" fontSize="small')} />
                                ) : index === 1 ? (
                                    <VideoLibrary className={cn('invert" fontSize="small')} />
                                ) : (
                                    <FormatListBulleted className={cn('invert" fontSize="small')} />
                                )}
                            </div>
                            <span className={cn('ml-3')}>{step}</span>
                        </div>
                    );
                })}
            </nav>
        </div>
    );
};
