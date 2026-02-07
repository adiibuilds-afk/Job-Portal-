import { Users, Activity, Briefcase, Percent } from 'lucide-react';

interface HeroKPIProps {
    label: string;
    value: string | number;
    subLabel: string;
    icon: any;
    color: 'amber' | 'green' | 'blue' | 'pink';
    loading: boolean;
}

function HeroKPICard({ label, value, subLabel, icon: Icon, color, loading }: HeroKPIProps) {
    const colorMap: Record<string, string> = {
        amber: 'from-amber-500 to-yellow-600 text-amber-500 border-amber-500/20 bg-amber-500/10',
        green: 'from-green-500 to-emerald-600 text-green-500 border-green-500/20 bg-green-500/10',
        blue: 'from-blue-500 to-cyan-600 text-blue-500 border-blue-500/20 bg-blue-500/10',
        pink: 'from-pink-500 to-rose-600 text-pink-500 border-pink-500/20 bg-pink-500/10',
    };
    const c = colorMap[color];

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 hover:border-amber-500/30 transition-all group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${c.split(' ')[0]} ${c.split(' ')[1]} opacity-5 blur-3xl -mr-12 -mt-12`} />
            <div className={`p-3 rounded-2xl bg-zinc-800 border border-zinc-700 ${c.split(' ')[2]} transition-transform group-hover:scale-110 w-fit mb-4`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="text-4xl font-black text-white mb-1">
                {loading ? <div className="h-10 w-24 bg-zinc-800 animate-pulse rounded" /> : value.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{label}</div>
            <div className={`text-[10px] font-bold mt-2 px-2 py-1 rounded-full border w-fit ${c.split(' ').slice(2).join(' ')}`}>
                {subLabel}
            </div>
        </div>
    );
}

export default function HeroKPIs({ stats, loading }: { stats: any; loading: boolean }) {
    const applyRate = stats?.totalJobViews > 0
        ? ((stats?.applyClicks / stats?.totalJobViews) * 100).toFixed(1)
        : '0.0';
    const dauMauRatio = stats?.mau > 0
        ? ((stats?.dau / stats?.mau) * 100).toFixed(1)
        : '0';

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <HeroKPICard
                label="Users Today"
                value={stats?.usersToday || 0}
                subLabel={`${stats?.usersWeek || 0} this week`}
                icon={Users}
                color="amber"
                loading={loading}
            />
            <HeroKPICard
                label="DAU / MAU"
                value={`${stats?.dau || 0}`}
                subLabel={`${dauMauRatio}% stickiness`}
                icon={Activity}
                color="green"
                loading={loading}
            />
            <HeroKPICard
                label="Jobs Added Today"
                value={stats?.jobsToday || 0}
                subLabel={`${stats?.jobsWeek || 0} this week`}
                icon={Briefcase}
                color="blue"
                loading={loading}
            />
            <HeroKPICard
                label="Apply Rate"
                value={`${applyRate}%`}
                subLabel={`${stats?.applyClicks || 0} clicks`}
                icon={Percent}
                color="pink"
                loading={loading}
            />
        </div>
    );
}
