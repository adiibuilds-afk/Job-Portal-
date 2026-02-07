"use client";

import { useState, useEffect } from 'react';
import { Brain, Zap, AlertTriangle, TrendingUp, Clock } from 'lucide-react';

interface AIUsageData {
    today: {
        tokensUsed: number;
        requestCount: number;
    };
    week: {
        totalTokens: number;
        totalRequests: number;
        totalErrors: number;
    };
    quota: {
        limit: number;
        used: number;
        percentUsed: number;
        resetsAt: string;
    };
}

export default function AIUsageCard() {
    const [data, setData] = useState<AIUsageData | null>(null);
    const [loading, setLoading] = useState(true);

    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/admin/ai-usage`);
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error('Failed to fetch AI usage', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const getTimeUntilReset = () => {
        if (!data?.quota?.resetsAt) return '...';
        const reset = new Date(data.quota.resetsAt);
        const now = new Date();
        const diff = reset.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${mins}m`;
    };

    if (loading) {
        return (
            <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 animate-pulse">
                <div className="h-20 bg-zinc-800 rounded-xl"></div>
            </div>
        );
    }

    const percentUsed = data?.quota?.percentUsed || 0;
    const strokeColor = percentUsed > 80 ? '#ef4444' : percentUsed > 50 ? '#f59e0b' : '#22c55e';

    return (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 hover:border-purple-500/30 transition-all">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-purple-500/10">
                        <Brain className="w-5 h-5 text-purple-500" />
                    </div>
                    <h3 className="font-bold text-white">AI Usage</h3>
                </div>
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <Clock className="w-3 h-3" />
                    <span>Resets in {getTimeUntilReset()}</span>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Circular Progress */}
                <div className="relative w-24 h-24">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="48"
                            cy="48"
                            r="40"
                            fill="none"
                            stroke="#27272a"
                            strokeWidth="8"
                        />
                        <circle
                            cx="48"
                            cy="48"
                            r="40"
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${percentUsed * 2.51} 251`}
                            className="transition-all duration-500"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-white">{percentUsed}%</span>
                        <span className="text-[10px] text-zinc-500">used</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-500" />
                            <span className="text-sm text-zinc-400">Today</span>
                        </div>
                        <span className="font-mono text-white">
                            {formatNumber(data?.today?.tokensUsed || 0)} tokens
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-zinc-400">This Week</span>
                        </div>
                        <span className="font-mono text-white">
                            {formatNumber(data?.week?.totalTokens || 0)} tokens
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-zinc-400">Errors</span>
                        </div>
                        <span className="font-mono text-red-400">
                            {data?.week?.totalErrors || 0}
                        </span>
                    </div>
                </div>
            </div>

            {/* Requests count */}
            <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between text-sm">
                <span className="text-zinc-500">API Requests Today</span>
                <span className="font-mono text-zinc-300">{data?.today?.requestCount || 0}</span>
            </div>
        </div>
    );
}
