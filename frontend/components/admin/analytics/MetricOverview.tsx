import { TrendingUp, Eye, MousePointer2 } from 'lucide-react';

interface MetricOverviewProps {
    chartData: any[];
}

export default function MetricOverview({ chartData }: MetricOverviewProps) {
    const stats = [
        { label: 'This Week Jobs', value: chartData.reduce((a: any, b: any) => a + (b.count || 0), 0), icon: TrendingUp, color: 'amber' },
        { label: 'Weekly Views', value: chartData.reduce((a: any, b: any) => a + (b.views || 0), 0), icon: Eye, color: 'blue' },
        { label: 'Weekly Clicks', value: chartData.reduce((a: any, b: any) => a + (b.clicks || 0), 0), icon: MousePointer2, color: 'pink' },
    ];

    return (
        <div className="grid grid-cols-3 gap-6">
            {stats.map((stat, i) => (
                <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl">
                    <div className={`p-3 rounded-2xl bg-zinc-800 border border-zinc-700 w-fit mb-4 text-${stat.color}-500`}>
                        <stat.icon className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
                    <h3 className="text-3xl font-black text-white">{stat.value.toLocaleString()}</h3>
                </div>
            ))}
        </div>
    );
}
