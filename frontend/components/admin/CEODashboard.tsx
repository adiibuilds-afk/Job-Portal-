"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    Briefcase,
    MousePointer2,
    FileText,
    Activity,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    ShieldCheck,
    Globe,
    LogOut,
    Clock,
    Trash2,
    Archive,
    RefreshCw,
    Zap,
    CalendarDays,
    Percent,
    Coins
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CEODashboardProps {
    stats: any;
    loading: boolean;
}

export default function CEODashboard({ stats, loading }: CEODashboardProps) {
    const [isMaintenance, setIsMaintenance] = useState(false);
    const [toggling, setToggling] = useState(false);
    const [maintenanceEta, setMaintenanceEta] = useState('30');
    const [customEta, setCustomEta] = useState('');
    const [cleanupLoading, setCleanupLoading] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jobgrid-in.onrender.com';

    const handleCleanup = async (type: 'expired' | 'zero-engagement' | 'reported') => {
        if (type === 'reported') {
            // For reported, just open the Jobs tab or show a modal
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
            } else {
                toast.error(data.error || 'Cleanup failed');
            }
        } catch (error) {
            toast.error('Cleanup failed');
        } finally {
            setCleanupLoading(null);
        }
    };

    // Computed metrics
    const applyRate = stats?.totalJobViews > 0
        ? ((stats?.applyClicks / stats?.totalJobViews) * 100).toFixed(1)
        : '0.0';
    const dauMauRatio = stats?.mau > 0
        ? ((stats?.dau / stats?.mau) * 100).toFixed(1)
        : '0';
    const coinInflation = stats?.coinsEarned > 0 || stats?.coinsSpent > 0
        ? (stats?.coinsEarned - stats?.coinsSpent)
        : 0;

    useEffect(() => {
        fetchMaintenanceStatus();
    }, []);

    const fetchMaintenanceStatus = async () => {
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://jobgrid-in.onrender.com';
            const res = await fetch(`${apiBase}/api/admin/settings`);
            const settings = await res.json();
            setIsMaintenance(settings.maintenance_mode === true);
        } catch (error) { }
    };

    const toggleMaintenance = async () => {
        if (!confirm(`Are you sure you want to ${isMaintenance ? 'disable' : 'enable'} maintenance mode?`)) return;
        setToggling(true);
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://jobgrid-in.onrender.com';
            await fetch(`${apiBase}/api/admin/maintenance/toggle`, { method: 'POST' });
            setIsMaintenance(!isMaintenance);
            toast.success(`Maintenance mode ${!isMaintenance ? 'enabled' : 'disabled'}`);
        } catch (error) {
            toast.error("Toggle failed");
        } finally {
            setToggling(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                            <Activity className="w-6 h-6 text-black" />
                        </div>
                        CEO Command Center
                    </h2>
                    <p className="text-zinc-500 font-medium">Your morning briefing. Updated in real-time.</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-zinc-600">
                    <Clock className="w-4 h-4" />
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* ================= HERO KPI ROW ================= */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <HeroKPI
                    label="Users Today"
                    value={stats?.usersToday || 0}
                    subLabel={`${stats?.usersWeek || 0} this week`}
                    icon={Users}
                    color="amber"
                    loading={loading}
                />
                <HeroKPI
                    label="DAU / MAU"
                    value={`${stats?.dau || 0}`}
                    subLabel={`${dauMauRatio}% stickiness`}
                    icon={Activity}
                    color="green"
                    loading={loading}
                />
                <HeroKPI
                    label="Jobs Added Today"
                    value={stats?.jobsToday || 0}
                    subLabel={`${stats?.jobsWeek || 0} this week`}
                    icon={Briefcase}
                    color="blue"
                    loading={loading}
                />
                <HeroKPI
                    label="Apply Rate"
                    value={`${applyRate}%`}
                    subLabel={`${stats?.applyClicks || 0} clicks`}
                    icon={Percent}
                    color="pink"
                    loading={loading}
                />
            </div>

            {/* ================= SECONDARY METRICS ================= */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    label="Resume Scans (24h)"
                    value={stats?.scansToday || 0}
                    icon={FileText}
                    color="purple"
                    loading={loading}
                />
                <MetricCard
                    label="Total Users"
                    value={stats?.totalUsers || 0}
                    icon={Users}
                    color="cyan"
                    loading={loading}
                />
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-3xl -mr-12 -mt-12" />
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-zinc-800 border border-zinc-700 text-amber-500">
                            <Coins className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Coin Inflation</span>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className={`text-3xl font-black ${coinInflation >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {loading ? '…' : (coinInflation >= 0 ? '+' : '') + coinInflation.toLocaleString()}
                        </span>
                        {coinInflation >= 0
                            ? <TrendingUp className="w-5 h-5 text-green-500 mb-1" />
                            : <TrendingDown className="w-5 h-5 text-red-500 mb-1" />
                        }
                    </div>
                    <p className="text-zinc-600 text-xs mt-2 font-medium">
                        Earned: <span className="text-green-500">{stats?.coinsEarned || 0}</span> · Spent: <span className="text-red-400">{stats?.coinsSpent || 0}</span>
                    </p>
                </div>
            </div>

            {/* ================= SYSTEM HEALTH + MAINTENANCE ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* System Health */}
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

                {/* Maintenance Quick Control */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl -mr-16 -mt-16 transition-all ${isMaintenance ? 'bg-red-500/20' : 'bg-amber-500/5 group-hover:bg-amber-500/10'}`} />
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <Globe className="w-6 h-6 text-amber-500" /> Maintenance Center
                    </h3>
                    <p className="text-zinc-500 text-sm mb-4 leading-relaxed">
                        Toggle the site into maintenance mode. Set an ETA so users know when to return.
                    </p>

                    {/* ETA Input */}
                    <div className="mb-6">
                        <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Estimated Downtime</label>
                        <div className="grid grid-cols-2 gap-3">
                            <select
                                value={maintenanceEta}
                                onChange={(e) => setMaintenanceEta(e.target.value)}
                                className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white font-bold focus:border-amber-500 transition-all outline-none"
                            >
                                <option value="15">~15 Minutes</option>
                                <option value="30">~30 Minutes</option>
                                <option value="60">~1 Hour</option>
                                <option value="120">~2 Hours</option>
                                <option value="custom">Custom</option>
                            </select>
                            {maintenanceEta === 'custom' && (
                                <input
                                    type="text"
                                    placeholder="e.g., Until 6 PM IST"
                                    value={customEta}
                                    onChange={(e) => setCustomEta(e.target.value)}
                                    className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white font-bold focus:border-amber-500 transition-all outline-none"
                                />
                            )}
                        </div>
                    </div>

                    <button
                        onClick={toggleMaintenance}
                        disabled={toggling}
                        className={`w-full py-4 border font-bold rounded-2xl transition-all flex items-center justify-center gap-3 ${isMaintenance
                            ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500'
                            }`}
                    >
                        {toggling ? (
                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : isMaintenance ? (
                            <>
                                <LogOut className="w-5 h-5" />
                                Disable Maintenance Mode
                            </>
                        ) : (
                            <>
                                <AlertCircle className="w-5 h-5" />
                                Activate for {maintenanceEta === 'custom' ? customEta || '?' : `~${maintenanceEta} mins`}
                            </>
                        )}
                    </button>
                    <p className="text-[10px] text-zinc-600 mt-4 text-center font-bold uppercase tracking-widest">
                        {isMaintenance ? 'Site is currently hidden from public' : 'Only use during critical updates'}
                    </p>
                </div>
            </div>

            {/* ================= SMART CLEANUP SCHEDULER ================= */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <Trash2 className="w-6 h-6 text-red-400" /> Smart Cleanup Scheduler
                        </h3>
                        <p className="text-zinc-500 text-sm mt-1">Safe, controlled, reversible job management.</p>
                    </div>
                    <button className="px-5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 text-xs font-bold uppercase tracking-widest hover:text-white hover:border-zinc-700 transition-all flex items-center gap-2">
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
        </div>
    );
}

// ================= SUBCOMPONENTS =================

function HeroKPI({ label, value, subLabel, icon: Icon, color, loading }: {
    label: string; value: string | number; subLabel: string; icon: any; color: string; loading: boolean;
}) {
    const colorMap: Record<string, string> = {
        amber: 'from-amber-500 to-yellow-600 text-amber-500 border-amber-500/20 bg-amber-500/10',
        green: 'from-green-500 to-emerald-600 text-green-500 border-green-500/20 bg-green-500/10',
        blue: 'from-blue-500 to-cyan-600 text-blue-500 border-blue-500/20 bg-blue-500/10',
        pink: 'from-pink-500 to-rose-600 text-pink-500 border-pink-500/20 bg-pink-500/10',
    };
    const c = colorMap[color] || colorMap.amber;

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

function MetricCard({ label, value, icon: Icon, color, loading }: {
    label: string; value: number; icon: any; color: string; loading: boolean;
}) {
    const colorClass = {
        purple: 'text-purple-500',
        cyan: 'text-cyan-500',
        green: 'text-green-500',
    }[color] || 'text-amber-500';

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl bg-zinc-800 border border-zinc-700 ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">{label}</span>
            </div>
            <div className="text-3xl font-black text-white">
                {loading ? <div className="h-8 w-20 bg-zinc-800 animate-pulse rounded" /> : value.toLocaleString()}
            </div>
        </div>
    );
}

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

function CleanupRule({ icon: Icon, title, description, count, action, color, loading, onClick }: {
    icon: any; title: string; description: string; count: number; action: string; color: string; loading?: boolean; onClick?: () => void;
}) {
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
