"use client"

import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { Card, CardContent } from '@/components/ui/card';
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { useEffect, useState } from "react"
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { CountVariation, PorcentialVariation} from "@/utils/types";

const chartConfig = {
    desktop: {
        label: "Curso",
        color: "#2563eb",
    }
} satisfies ChartConfig

export function CourseSellsChart() {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchReportsData = async () => {
            const response = await fetch('/api/courses/reports/total-sales', { method: 'GET' });
            const result = await response.json();
            if (result.success) {
                setChartData(result.data);
            }
        }

        fetchReportsData();
    }, []);

    return (
        <ChartContainer config={chartConfig} className={cn("min-h-[80px] w-full")}>
            <BarChart accessibilityLayer data={chartData}>
                <XAxis
                    dataKey="courseName"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                />
                <YAxis />
                <Bar dataKey="total" fill="var(--color-desktop)" radius={4} />
            </BarChart>
        </ChartContainer>
    )
}

async function fetchTotalSalesLasthMonth() {
    const response = await fetch('/api/courses/reports/total-sales-last-month', { method: 'GET' });
    const result = await response.json();
    if (!result.success) {
        return {
            count: 0,
            arrowDirection: 'down'
        };
    }
    return result.data;
}

async function fetchTotalUsersLasthMonth() {
    const response = await fetch('/api/courses/reports/total-users-last-month', { method: 'GET' });
    const result = await response.json();
    if (!result.success) {
        return {
            percentage: 0,
            arrowDirection: 0
        };
    }
    return result.data;
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


    useEffect(() => {
        (async () => {
            const res = await fetchTotalUsersLasthMonth();
            setUserStats(res);
        })();

        (async () => {
            const res = await fetchTotalSalesLasthMonth();
            setCourseStats(res);
        })();
    }, []);

    const isUpUsers = userStats.arrowDirection === 'up';
    const isUpCourses = courseStats.arrowDirection === 'up';

    return (
        <div className={cn("flex flex-col gap-6")}>
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