"use client";

import React from 'react';
import { Activity, Clock, FileText, Users, Coins, TrendingUp, TrendingDown } from 'lucide-react';
import HeroKPIs from './ceo/HeroKPIs';
import SystemHealth from './ceo/SystemHealth';
import MaintenanceControl from './ceo/MaintenanceControl';
import SmartCleanup from './ceo/SmartCleanup';

interface CEODashboardProps {
    stats: any;
    loading: boolean;
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

export default function CEODashboard({ stats, loading }: CEODashboardProps) {
    const coinInflation = stats?.coinsEarned > 0 || stats?.coinsSpent > 0
        ? (stats?.coinsEarned - stats?.coinsSpent)
        : 0;

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

            <HeroKPIs stats={stats} loading={loading} />

            {/* Secondary Metrics */}
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SystemHealth stats={stats} />
                <MaintenanceControl />
            </div>

            <SmartCleanup stats={stats} />
        </div>
    );
}
