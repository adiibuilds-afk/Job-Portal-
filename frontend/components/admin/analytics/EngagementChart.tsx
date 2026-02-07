import { Eye } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface EngagementChartProps {
    data: any[];
}

export default function EngagementChart({ data }: EngagementChartProps) {
    return (
        <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-[2.5rem]">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Eye className="w-5 h-5 text-blue-500" />
                Views vs Clicks
            </h3>
            <div className="w-full" style={{ height: 300, minHeight: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis dataKey="_id" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => val?.split('-').slice(1).join('/') || ''} />
                        <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', fontSize: '12px' }} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="views" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Views" />
                        <Bar dataKey="clicks" fill="#ec4899" radius={[6, 6, 0, 0]} name="Clicks" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
