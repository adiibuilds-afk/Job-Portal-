import { TrendingUp, Eye, ShieldCheck, Sparkles } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';

interface AnalyticsTabProps {
    chartData: any[];
    runCleanup: () => void;
    cleaning: boolean;
}

export default function AnalyticsTab({ chartData, runCleanup, cleaning }: AnalyticsTabProps) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-10">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Traffic Chart */}
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-amber-500" />
                        Growth (Last 7 Days)
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
                                    stroke="#71717a"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => val.split('-').slice(1).join('/')}
                                />
                                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                                    itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* View Trends */}
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-blue-500" />
                        Engagement (Views)
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis dataKey="_id" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }} />
                                <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Smart Tools */}
            <div className="bg-zinc-900/50 border border-amber-500/20 p-10 rounded-3xl text-center border-dashed">
                <ShieldCheck className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-white">Smart Cleanup Utility</h2>
                <p className="text-zinc-500 max-w-lg mx-auto mt-2 mb-8">
                    AI-Powered maintenance that identifies and removes expired, low-engagement, or outdated job listings to keep your platform premium.
                </p>
                <button
                    onClick={runCleanup}
                    disabled={cleaning}
                    className="px-8 py-3 bg-amber-500 text-black font-black rounded-xl hover:bg-amber-400 disabled:opacity-50 transition-all flex items-center gap-2 mx-auto"
                >
                    <Sparkles className="w-5 h-5" />
                    {cleaning ? 'Cleaning Hub...' : 'Run Smart Cleanup Now'}
                </button>
            </div>
        </div>
    );
}
