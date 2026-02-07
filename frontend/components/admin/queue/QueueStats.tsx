import { Clock, CheckCircle2, Link2 } from 'lucide-react';

interface QueueStatsProps {
    pendingCount: number;
    processedCount: number;
    totalCount: number;
}

export default function QueueStats({ pendingCount, processedCount, totalCount }: QueueStatsProps) {
    const stats = [
        { label: 'Pending', value: pendingCount, icon: Clock, color: 'text-amber-500' },
        { label: 'Processed', value: processedCount, icon: CheckCircle2, color: 'text-green-500' },
        { label: 'Total Links', value: totalCount, icon: Link2, color: 'text-blue-500' },
    ];

    return (
        <div className="grid grid-cols-3 gap-6">
            {stats.map((stat, i) => (
                <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl">
                    <div className={`p-3 rounded-2xl bg-zinc-800 border border-zinc-700 w-fit mb-4 ${stat.color}`}>
                        <stat.icon className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
                    <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                </div>
            ))}
        </div>
    );
}
