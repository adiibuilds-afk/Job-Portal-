"use client";

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { Flame } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jobgrid-in.onrender.com';

interface HeatmapDay {
    date: string;
    count: number;
}

// Color intensity based on count
const getColor = (count: number): string => {
    if (count === 0) return 'bg-zinc-800/50';
    if (count === 1) return 'bg-green-900';
    if (count <= 3) return 'bg-green-700';
    if (count <= 5) return 'bg-green-500';
    return 'bg-green-400';
};

export default function ActivityHeatmap() {
    const { data: session } = useSession();
    const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);

    useEffect(() => {
        if (session?.user?.email) {
            fetchHeatmapData();
        }
    }, [session]);

    const fetchHeatmapData = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/user/activity-heatmap?email=${session?.user?.email}`);
            setHeatmapData(data.heatmapData || []);
        } catch (error) {
            console.error("Failed to fetch heatmap data", error);
        } finally {
            setLoading(false);
        }
    };

    // Group data strictly by month
    const monthsData = useMemo(() => {
        if (!heatmapData.length) return [];

        const byMonth: { name: string; weeks: HeatmapDay[][] }[] = [];
        let currentMonthName = '';
        let currentMonthDays: HeatmapDay[] = [];

        // Helper to turn a linear array of month-days into a 7-day padded grid
        const buildWeeksForMonth = (days: HeatmapDay[]) => {
            const weeks: HeatmapDay[][] = [];
            if (days.length === 0) return weeks;

            let currentWeek: HeatmapDay[] = [];

            // Pad Start of Month
            const firstDay = new Date(days[0].date);
            const startDayIndex = firstDay.getDay(); // 0 = Sun

            for (let i = 0; i < startDayIndex; i++) {
                currentWeek.push({ date: '', count: -1 }); // Transparent placeholder
            }

            // Fill Days
            days.forEach(day => {
                currentWeek.push(day);
                if (currentWeek.length === 7) {
                    weeks.push(currentWeek);
                    currentWeek = [];
                }
            });

            // Pad End of Month
            if (currentWeek.length > 0) {
                while (currentWeek.length < 7) {
                    currentWeek.push({ date: '', count: -1 });
                }
                weeks.push(currentWeek);
            }

            return weeks;
        };

        // 1. Group continuous days into Month buckets
        heatmapData.forEach((day) => {
            if (!day.date) return;
            const monthName = new Date(day.date).toLocaleDateString('en-US', { month: 'short' });

            if (monthName !== currentMonthName) {
                if (currentMonthName) {
                    byMonth.push({ name: currentMonthName, weeks: buildWeeksForMonth(currentMonthDays) });
                }
                currentMonthName = monthName;
                currentMonthDays = [];
            }
            currentMonthDays.push(day);
        });

        // Push final month
        if (currentMonthName && currentMonthDays.length > 0) {
            byMonth.push({ name: currentMonthName, weeks: buildWeeksForMonth(currentMonthDays) });
        }

        return byMonth;
    }, [heatmapData]);

    const totalApplications = useMemo(() => {
        return heatmapData.reduce((sum, day) => sum + day.count, 0);
    }, [heatmapData]);

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-32 bg-zinc-800 rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-xl">
                        <Flame className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Application Activity</h3>
                        <p className="text-xs text-zinc-500">{totalApplications} applications in the last year</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                    <span>Less</span>
                    <div className="w-3 h-3 rounded-sm bg-zinc-800/50"></div>
                    <div className="w-3 h-3 rounded-sm bg-green-900"></div>
                    <div className="w-3 h-3 rounded-sm bg-green-700"></div>
                    <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                    <div className="w-3 h-3 rounded-sm bg-green-400"></div>
                    <span>More</span>
                </div>
            </div>

            {/* Monthly Heatmap Blocks */}
            <div className="overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex justify-between w-full min-w-max">
                    {monthsData.map((month, mIndex) => (
                        <div key={month.name + mIndex} className="flex flex-col gap-2">
                            {/* Weeks Grid for this Month */}
                            <div className="flex gap-[2px]">
                                {month.weeks.map((week, wIndex) => (
                                    <div key={wIndex} className="flex flex-col gap-[2px]">
                                        {week.map((day, dIndex) => (
                                            <div
                                                key={`${mIndex}-${wIndex}-${dIndex}`}
                                                className={`w-[11px] h-[11px] rounded-[3px] transition-all ${day.count === -1 ? 'bg-transparent' : getColor(day.count)} hover:ring-1 hover:ring-white/50 cursor-pointer`}
                                                onMouseEnter={() => day.count !== -1 && setHoveredDay(day)}
                                                onMouseLeave={() => setHoveredDay(null)}
                                                title={day.date ? `${day.date}: ${day.count} application(s)` : ''}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>

                            {/* Month Label */}
                            <div className="text-xs text-zinc-500 font-medium text-center">
                                {month.name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tooltip */}
            {hoveredDay && (
                <div className="mt-4 text-center text-sm text-zinc-400">
                    <span className="font-bold text-white">{hoveredDay.count}</span> application(s) on{' '}
                    <span className="text-green-400">{new Date(hoveredDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
            )}
        </div>
    );
}
