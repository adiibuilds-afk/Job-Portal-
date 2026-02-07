import { TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface GrowthChartProps {
    data: any[];
}

export default function GrowthChart({ data }: GrowthChartProps) {
    return (
        <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-[2.5rem]">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                Job Growth (Last 7 Days)
            </h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis
                            dataKey="_id"
                            stroke="#52525b"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => val?.split('-').slice(1).join('/') || ''}
                        />
                        <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', fontSize: '12px' }}
                            itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
