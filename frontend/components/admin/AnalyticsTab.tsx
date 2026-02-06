"use client";

import { TrendingUp, Eye, ShieldCheck, Sparkles, BarChart3, Activity, MousePointer2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, BarChart, Bar, Legend } from 'recharts';

interface AnalyticsTabProps {
    chartData: any[];
    runCleanup: () => void;
    cleaning: boolean;
}

export default function AnalyticsTab({ chartData, runCleanup, cleaning }: AnalyticsTabProps) {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
                        <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    Deep Analytics
                </h2>
                <p className="text-zinc-500 font-medium">Platform trends, engagement metrics, and intelligence.</p>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-6">
                {[
                    { label: 'This Week Jobs', value: chartData.reduce((a: any, b: any) => a + (b.count || 0), 0), icon: TrendingUp, color: 'amber' },
                    { label: 'Weekly Views', value: chartData.reduce((a: any, b: any) => a + (b.views || 0), 0), icon: Eye, color: 'blue' },
                    { label: 'Weekly Clicks', value: chartData.reduce((a: any, b: any) => a + (b.clicks || 0), 0), icon: MousePointer2, color: 'pink' },
                ].map((stat, i) => (
                    <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl">
                        <div className={`p-3 rounded-2xl bg-zinc-800 border border-zinc-700 w-fit mb-4 text-${stat.color}-500`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-black text-white">{stat.value.toLocaleString()}</h3>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Traffic Chart */}
                <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-[2.5rem]">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-amber-500" />
                        Job Growth (Last 7 Days)
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis
                                    dataKey="_id"
                                    stroke="#52525b"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => val?.split('-').slice(1).join('/') || ''}
                                />
                                <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', fontSize: '12px' }}
                                    itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Engagement Chart */}
                <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-[2.5rem]">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <Eye className="w-5 h-5 text-blue-500" />
                        Views vs Clicks
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis dataKey="_id" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => val?.split('-').slice(1).join('/') || ''} />
                                <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', fontSize: '12px' }} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="views" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Views" />
                                <Bar dataKey="clicks" fill="#ec4899" radius={[6, 6, 0, 0]} name="Clicks" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Smart Cleanup CTA */}
            <div className="bg-zinc-950 border border-amber-500/20 p-10 rounded-[2.5rem] text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/5 blur-[100px] -ml-32 -mt-32" />
                <div className="relative z-10">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-500/20">
                        <ShieldCheck className="w-8 h-8 text-black" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">Smart Cleanup Utility</h2>
                    <p className="text-zinc-500 max-w-lg mx-auto mb-8">
                        AI-Powered maintenance that identifies and removes expired, low-engagement, or outdated job listings to keep your platform premium.
                    </p>
                    <button
                        onClick={runCleanup}
                        disabled={cleaning}
                        className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black rounded-2xl hover:scale-105 disabled:opacity-50 transition-all flex items-center gap-3 mx-auto shadow-xl shadow-amber-500/20"
                    >
                        <Sparkles className="w-5 h-5" />
                        {cleaning ? 'Cleaning Hub...' : 'Run Smart Cleanup Now'}
                    </button>
                </div>
            </div>
        </div>
    );
}
