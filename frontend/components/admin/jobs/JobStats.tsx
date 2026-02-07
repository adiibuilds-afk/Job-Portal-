import { Briefcase, AlertTriangle, Eye, TrendingUp } from 'lucide-react';
import { AdminAnalytics } from '@/types';

interface JobStatsProps {
    totalJobs: number;
    reportedCount: number;
    analytics: AdminAnalytics;
}

export default function JobStats({ totalJobs, reportedCount, analytics }: JobStatsProps) {
    const stats = [
        { label: 'Active Jobs', value: totalJobs, icon: Briefcase, color: 'amber', trend: '+12 today' },
        { label: 'Reports', value: reportedCount, icon: AlertTriangle, color: 'red', trend: 'Review needed' },
        { label: 'Total Views', value: analytics.totalViews.toLocaleString(), icon: Eye, color: 'blue', trend: '+5.2%' },
        { label: 'Avg CTR', value: `${((analytics.totalClicks / (analytics.totalViews || 1)) * 100).toFixed(1)}%`, icon: TrendingUp, color: 'green', trend: 'Healthy' },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
                <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-2xl bg-zinc-800 border border-zinc-700 text-${stat.color}-500 transition-transform group-hover:scale-110`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 bg-${stat.color}-500/10 text-${stat.color}-500 rounded-full border border-${stat.color}-500/20`}>
                            {stat.trend}
                        </span>
                    </div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
                    <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                </div>
            ))}
        </div>
    );
}
