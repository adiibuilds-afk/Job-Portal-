"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SalaryData {
    _id: string; // Role Type
    avgSalary: number;
    minSalary: number;
    maxSalary: number;
    count: number;
}

interface SalaryChartProps {
    data: SalaryData[];
}

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-zinc-900 border border-zinc-700 p-4 rounded-lg shadow-xl text-sm">
                <p className="font-bold text-white mb-2">{label}</p>
                <div className="space-y-1">
                    <p className="text-amber-400">Avg: <span className="font-mono">{payload[0].value.toFixed(1)} LPA</span></p>
                    <p className="text-zinc-400">Range: {payload[0].payload.minSalary} - {payload[0].payload.maxSalary} LPA</p>
                    <p className="text-zinc-500 text-xs mt-2">{payload[0].payload.count} jobs analyzed</p>
                </div>
            </div>
        );
    }
    return null;
};

export default function SalaryChart({ data }: SalaryChartProps) {
    if (!data || data.length === 0) return <div className="text-zinc-500 text-center py-10">No salary data available</div>;

    return (
        <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} vertical={false} />
                    <XAxis
                        dataKey="_id"
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        angle={-45}
                        textAnchor="end"
                        interval={0}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        unit=" LPA"
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="avgSalary" radius={[4, 4, 0, 0]} animationDuration={1500}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
