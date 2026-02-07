import { Clock, CheckCircle2, Link2, AlertCircle } from 'lucide-react';

interface QueueStatsProps {
    pendingCount: number;
    processedCount: number;
    failedCount: number;
    totalCount: number;
}

export default function QueueStats({ pendingCount, processedCount, failedCount, totalCount }: QueueStatsProps) {
    const stats = [
        { label: 'Pending', value: pendingCount, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Processed', value: processedCount, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
        { label: 'Failed', value: failedCount, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
        { label: 'Total Links', value: totalCount, icon: Link2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
                <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl">
                    <div className={`p-2.5 rounded-xl ${stat.bg} w-fit mb-3 ${stat.color}`}>
                        <stat.icon className="w-4 h-4" />
                    </div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
                    <h3 className="text-2xl font-black text-white">{stat.value}</h3>
                </div>
            ))}
        </div>
    );
}
