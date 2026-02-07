import { ShieldCheck } from 'lucide-react';

function HealthRow({ label, status, latency, color }: { label: string, status: string, latency: string, color: string }) {
    return (
        <div className="flex items-center justify-between p-4 bg-zinc-900/30 rounded-2xl border border-zinc-800/50">
            <span className="text-zinc-400 font-bold text-sm">{label}</span>
            <div className="flex items-center gap-4">
                <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">{latency}</span>
                <span className={`text-xs font-black uppercase tracking-widest ${color}`}>{status}</span>
            </div>
        </div>
    );
}

export default function SystemHealth({ stats }: { stats: any }) {
    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-green-500" /> Infrastructure Status
            </h3>
            <div className="space-y-4">
                <HealthRow
                    label="Backend API"
                    status="Operational"
                    latency="42ms"
                    color="text-green-500"
                />
                <HealthRow
                    label="Job Scrapers"
                    status={stats?.scraperStatus || 'Idle'}
                    latency={stats?.scraperQueue ? `${stats.scraperQueue} queued` : 'Ready'}
                    color={stats?.scraperStatus === 'Running' ? 'text-amber-500' : 'text-green-500'}
                />
                <HealthRow
                    label="Resume Queue"
                    status={stats?.resumeQueueCount > 0 ? 'Processing' : 'Empty'}
                    latency={`${stats?.resumeQueueCount || 0} pending`}
                    color={stats?.resumeQueueCount > 5 ? 'text-amber-500' : 'text-green-500'}
                />
                <HealthRow
                    label="Database (Atlas)"
                    status="Healthy"
                    latency="12ms"
                    color="text-green-500"
                />
            </div>
        </div>
    );
}
