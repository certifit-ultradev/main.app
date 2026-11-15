"use client"

import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { Card, CardContent } from '@/components/ui/card';
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { useEffect, useState } from "react"
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CountVariation, PorcentialVariation } from '@/features/courses/analytics/course-analytics.client.types';
import {
    getCourseSalesReport,
    getMonthlySalesReport,
    getMonthlyUsersReport,
} from '@/features/courses/analytics/reports-http.client';

const chartConfig = {
    desktop: {
        label: "Curso",
        color: "#2563eb",
    }
} satisfies ChartConfig

export function CourseSellsChart() {
    const [chartData, setChartData] = useState<{ course_name: string; total: number }[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReportsData = async () => {
            try {
                setChartData(await getCourseSalesReport());
            } catch {
                setError('No fue posible cargar las ventas por curso.');
            }
        }

        fetchReportsData();
    }, []);

    return (
        <>
            <ChartContainer config={chartConfig} className={cn("min-h-[80px] w-full")}>
                <BarChart accessibilityLayer data={chartData}>
                    <XAxis dataKey="course_name" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis />
                    <Bar dataKey="total" fill="var(--color-desktop)" radius={4} />
                </BarChart>
            </ChartContainer>
            {error && <p role="alert">{error}</p>}
        </>
    )
}

export function LastMonthCharts() {
    const [userStats, setUserStats] = useState<PorcentialVariation>({
        percentage: 0,
        arrowDirection: 'down'
    });
    const [courseStats, setCourseStats] = useState<CountVariation>({
        count: 0,
        arrowDirection: 'down'
    });
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        void Promise.all([getMonthlyUsersReport(), getMonthlySalesReport()])
            .then(([users, sales]) => {
                setUserStats(users);
                setCourseStats(sales);
            })
            .catch(() => setError('No fue posible cargar las métricas mensuales.'));
    }, []);

    const isUpUsers = userStats.arrowDirection === 'up';
    const isUpCourses = courseStats.arrowDirection === 'up';

    return (
        <div className={cn("flex flex-col gap-6")}>
            {error && <p role="alert">{error}</p>}
            <Card className={cn("w-[15rem] h-[12rem] bg-[#2C95AF] rounded-xl p-4 text-white")}>
                <CardContent className="h-full flex flex-col justify-between">
                    {/* Título */}
                    <h2 className="text-sm font-medium">Ventas</h2>

                    {/* Sección principal: cifra y flecha hacia arriba */}
                    <div className="flex items-center gap-2">
                        <span className="text-4xl font-bold">{courseStats.count}</span>
                        {isUpCourses ? <ArrowUp className="w-5 h-5 text-green-400" /> : <ArrowDown className="w-5 h-5 text-red-500" />}
                    </div>

                    {/* Texto descriptivo */}
                    <p className="text-sm">en el ultimo mes</p>
                </CardContent>
            </Card>

            {/* Tarjeta: Nuevos usuarios */}
            <Card className={cn("w-[15rem] h-[12rem] rounded-xl p-4 border border-gray-200")}>
                <CardContent className="h-full flex flex-col justify-between">
                    <h2 className="text-sm font-medium">Nuevos usuarios</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-4xl font-bold text-red-500">{userStats.percentage}%</span>
                        {isUpUsers ? <ArrowUp className="w-5 h-5 text-green-400" /> : <ArrowDown className="w-5 h-5 text-red-500" />}
                    </div>
                    <p className="text-sm text-gray-500">en el ultimo mes</p>
                </CardContent>
            </Card>
        </div>
    )
}
