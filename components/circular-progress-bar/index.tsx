import React from 'react';

function CircularProgress({ progress = 50, size = 64, strokeWidth = 8, withLegend = false }) {
    // progress es un número entre 0 y 100
    // Cálculo del perímetro del círculo
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Calcular cuanto del perímetro se llena según el progreso
    const offset = (progress / 100) * circumference - circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg
                className="transform rotate-[-90deg]"
                width={size}
                height={size}
            >
                {/* Círculo de fondo */}
                <circle
                    className="text-gray-300"
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                {/* Círculo de progreso */}
                <circle
                    className="text-[#0BBBE7] transition-all duration-300"
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            {withLegend ? (
                <span className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">{`${progress}%`}</span>
                    <span className="text-xs text-gray-500">Completado</span>
                </span>
            ) : (<></>)}

        </div>
    );
}

export default CircularProgress;
