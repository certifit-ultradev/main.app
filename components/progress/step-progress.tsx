import { cn } from "@/lib/utils";

type StepProgressProp = {
    step: number
    max: number
    label?: string
}

export const StepProgress = ({ step, max, label = "Paso" }: StepProgressProp) => {
    return (
        <div className={cn('flex justify-center')}>
            <div className={cn('flex flex-col px-10  w-[50rem]')}>
                <p className={cn('pb-2')}>{label} {step} de {max}</p>
                <progress value={step} max={max} className={cn('h-2 w-full appearance-none rounded-full [&::-webkit-progress-bar]:bg-gray-300 [&::-webkit-progress-value]:bg-[#33C8A2][&::-moz-progress-bar]:bg-[#33C8A2]')} />
            </div>
        </div>
    );
}