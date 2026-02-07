import { Trash2, RefreshCw, Archive, CalendarDays, Zap, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

function CleanupRule({ icon: Icon, title, description, count, action, color, loading, onClick }: any) {
    const colorMap: Record<string, string> = {
        amber: 'text-amber-500 border-amber-500/30 hover:bg-amber-500/10',
        red: 'text-red-400 border-red-500/30 hover:bg-red-500/10',
        orange: 'text-orange-500 border-orange-500/30 hover:bg-orange-500/10',
    };

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between hover:border-zinc-700 transition-all">
            <div>
                <div className={`p-3 rounded-2xl bg-zinc-800 border border-zinc-700 w-fit mb-4 ${colorMap[color]?.split(' ')[0]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-lg mb-1">{title}</h4>
                <p className="text-zinc-500 text-sm">{description}</p>
            </div>
            <div className="flex items-center justify-between mt-6">
                <span className="text-3xl font-black text-white">{count}</span>
                <button
                    onClick={onClick}
                    disabled={loading || count === 0}
                    className={`px-4 py-2 border rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed ${colorMap[color]}`}
                >
                    {loading ? (
                        <RefreshCw className="w-3 h-3 inline mr-1.5 animate-spin" />
                    ) : (
                        <Archive className="w-3 h-3 inline mr-1.5" />
                    )}
                    {loading ? 'Working...' : action}
                </button>
            </div>
        </div>
    );
}

export default function SmartCleanup({ stats, onRunAnalysis }: { stats: any, onRunAnalysis: () => void }) {
    const [cleanupLoading, setCleanupLoading] = useState<string | null>(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jobgrid-in.onrender.com';

    // ... (handleCleanup logic remains same)

    const handleCleanup = async (type: 'expired' | 'zero-engagement' | 'reported') => {
        if (type === 'reported') {
            toast.success('Switch to Jobs tab → Reported filter to review');
            return;
        }

        if (!confirm(`Are you sure you want to archive all ${type === 'expired' ? 'expired (45+ days old)' : 'zero-engagement'} jobs?`)) return;

        setCleanupLoading(type);
        try {
            const res = await fetch(`${API_URL}/api/admin/cleanup/${type}`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                onRunAnalysis(); // Refresh stats after cleanup
            } else {
                toast.error(data.error || 'Cleanup failed');
            }
        } catch (error) {
            toast.error('Cleanup failed');
        } finally {
            setCleanupLoading(null);
        }
    };

    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <Trash2 className="w-6 h-6 text-red-400" /> Smart Cleanup Scheduler
                    </h3>
                    <p className="text-zinc-500 text-sm mt-1">Safe, controlled, reversible job management.</p>
                </div>
                <button
                    onClick={onRunAnalysis}
                    className="px-5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 text-xs font-bold uppercase tracking-widest hover:text-white hover:border-zinc-700 transition-all flex items-center gap-2 active:scale-95"
                >
                    <RefreshCw className="w-3 h-3" /> Run Analysis
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <CleanupRule
                    icon={CalendarDays}
                    title="Expired Jobs"
                    description="Jobs older than 45 days"
                    count={stats?.expiredJobs || 0}
                    action="Archive All"
                    color="amber"
                    loading={cleanupLoading === 'expired'}
                    onClick={() => handleCleanup('expired')}
                />
                <CleanupRule
                    icon={Zap}
                    title="Zero Engagement"
                    description="No clicks or saves"
                    count={stats?.zeroEngagementJobs || 0}
                    action="Archive All"
                    color="red"
                    loading={cleanupLoading === 'zero-engagement'}
                    onClick={() => handleCleanup('zero-engagement')}
                />
                <CleanupRule
                    icon={AlertCircle}
                    title="High Reports"
                    description="Flagged by users"
                    count={stats?.reportedJobs || 0}
                    action="Review"
                    color="orange"
                    loading={cleanupLoading === 'reported'}
                    onClick={() => handleCleanup('reported')}
                />
            </div>
        </div>
    );
}
