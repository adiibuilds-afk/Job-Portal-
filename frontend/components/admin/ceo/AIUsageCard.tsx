"use client";

import { useState, useEffect } from 'react';
import { Brain, Zap, AlertTriangle, TrendingUp, Clock } from 'lucide-react';

interface AIUsageData {
    today: {
        tokensUsed: number;
        requestCount: number;
        apiKeys: Record<string, { tokens: number; requests: number }>;
    };
    apiKeys: Record<string, { tokens: number; requests: number }>;
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
        <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 hover:border-purple-500/30 transition-all flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-purple-500/10">
                        <Brain className="w-5 h-5 text-purple-500" />
                    </div>
                    <h3 className="font-bold text-white uppercase tracking-wider text-xs">AI Ecosystem</h3>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-bold">
                    <Clock className="w-3 h-3" />
                    <span>Reset in {getTimeUntilReset()}</span>
                </div>
            </div>

            <div className="flex items-center gap-6 mb-6">
                {/* Circular Progress */}
                <div className="relative w-20 h-20 shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="40" cy="40" r="36" fill="none" stroke="#27272a" strokeWidth="6" />
                        <circle
                            cx="40" cy="40" r="36" fill="none" stroke={strokeColor} strokeWidth="6"
                            strokeLinecap="round" strokeDasharray={`${percentUsed * 2.26} 226`}
                            className="transition-all duration-500"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-black text-white">{percentUsed}%</span>
                        <span className="text-[8px] text-zinc-500 uppercase font-black">quota</span>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-2">
                    <div className="bg-zinc-950/50 p-2 rounded-xl border border-zinc-800">
                        <span className="text-[8px] text-zinc-500 block uppercase font-black mb-1">Tokens Today</span>
                        <span className="text-sm font-black text-white">{formatNumber(data?.today?.tokensUsed || 0)}</span>
                    </div>
                    <div className="bg-zinc-950/50 p-2 rounded-xl border border-zinc-800">
                        <span className="text-[8px] text-zinc-500 block uppercase font-black mb-1">Active Keys</span>
                        <span className="text-sm font-black text-purple-400">4 / 4</span>
                    </div>
                </div>
            </div>

            {/* API Keys Breakdown */}
            <div className="space-y-2 mb-6">
                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Node Distribution (Tokens)</p>
                {[1, 2, 3, 4].map((i) => {
                    const keyData = data?.apiKeys?.[`apiKey${i}`] || { tokens: 0, requests: 0 };
                    const maxTokensToday = Math.max(...(Object.values(data?.apiKeys || {}) as any[]).map(k => k.tokens), 1);
                    const width = (keyData.tokens / maxTokensToday) * 100;

                    return (
                        <div key={i} className="group">
                            <div className="flex justify-between items-center text-[10px] mb-1 px-1">
                                <span className="font-bold text-zinc-400">API Key {i}</span>
                                <span className="font-mono text-zinc-500">{formatNumber(keyData.tokens)} tkn</span>
                            </div>
                            <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-1000"
                                    style={{ width: `${Math.max(2, width)}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Summary Stats */}
            <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <div>
                        <p className="text-[8px] text-zinc-500 uppercase font-black">History (7d)</p>
                        <p className="text-xs font-black text-white">{formatNumber(data?.week?.totalTokens || 0)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-right justify-end">
                    <div className="text-right">
                        <p className="text-[8px] text-zinc-500 uppercase font-black text-right">Error Buffer</p>
                        <p className={`text-xs font-black ${data?.week?.totalErrors! > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {data?.week?.totalErrors || 0} hits
                        </p>
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full ${data?.week?.totalErrors! > 0 ? 'bg-red-500' : 'bg-green-500'}`} />
                </div>
            </div>
        </div>
    );
}
