import { cn } from "@/lib/utils";

const Loading = () => {
    return (
        <div className={cn("max-w-7xl mx-auto px-4 animate-pulse")}>

            {/* Contenedor principal con 3 tarjetas */}
            <div className={cn("flex gap-6")}>
                {/* Tarjeta 1 (con checklist + círculo) */}
                <div className={cn("bg-white border border-gray-200 rounded-xl p-4 shadow-sm w-80")}>
                    <div className={cn("relative mb-4")}>
                        {/* Imagen */}
                        <div className={cn("w-full h-40 bg-gray-200 rounded-lg mb-4")} />
                    </div>
                    <div className={cn("h-5 w-16 bg-gray-200 rounded mb-2")} />
                    <div className={cn("h-6 w-40 bg-gray-200 rounded mb-4")} />
                    <div className={cn("h-9 w-24 bg-gray-200 rounded-full")} />
                </div>

                {/* Tarjeta 2 (con imagen y botón) */}
                <div className={cn("bg-white border border-gray-200 rounded-xl p-4 shadow-sm w-80")}>
                    <div className={cn("relative mb-4")}>
                        {/* Imagen */}
                        <div className={cn("w-full h-40 bg-gray-200 rounded-lg mb-4")} />
                    </div>
                    <div className={cn("h-5 w-16 bg-gray-200 rounded mb-2")} />
                    <div className={cn("h-6 w-40 bg-gray-200 rounded mb-4")} />
                    <div className={cn("h-9 w-24 bg-gray-200 rounded-full")} />
                </div>

                {/* Tarjeta 3 (con imagen y botón) */}
                <div className={cn("bg-white border border-gray-200 rounded-xl p-4 shadow-sm w-80")}>
                    <div className={cn("relative mb-4")}>
                        {/* Imagen */}
                        <div className={cn("w-full h-40 bg-gray-200 rounded-lg mb-4")} />
                    </div>
                    <div className={cn("h-5 w-16 bg-gray-200 rounded mb-2")} />
                    <div className={cn("h-6 w-40 bg-gray-200 rounded mb-4")} />
                    <div className={cn("h-9 w-24 bg-gray-200 rounded-full")} />
                </div>
            </div>
        </div>
    )
}

export default Loading;