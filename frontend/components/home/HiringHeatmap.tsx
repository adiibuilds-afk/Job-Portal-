"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Activity, Zap, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface CompanyStat {
    _id: string; // Company Name
    count: number;
}

export default function HiringHeatmap() {
    const [companies, setCompanies] = useState<CompanyStat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/stats`);
                if (data.topCompanies) {
                    setCompanies(data.topCompanies);
                }
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return null;
    if (companies.length === 0) return null;

    // Sort by count for ranking
    const sorted = [...companies].sort((a, b) => b.count - a.count);

    return (
        <div className="relative py-4">
            <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                        </span>
                        <span className="text-xs font-mono text-amber-500 font-bold tracking-widest uppercase">Live Market Data</span>
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight">
                        Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Recruiters</span>
                    </h2>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {sorted.slice(0, 4).map((company, idx) => (
                    <Link
                        href={`/jobs?q=${company._id}`}
                        key={company._id}
                        className="group relative overflow-hidden bg-zinc-900/40 border border-zinc-800 hover:border-amber-500/50 rounded-xl p-5 transition-all hover:bg-zinc-900/80"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/0 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-xl text-zinc-500 group-hover:text-white group-hover:bg-amber-500 transition-all duration-300 shadow-lg shadow-black/50">
                                {company._id[0]}
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-mono text-zinc-500">OPENINGS</div>
                                <div className="text-2xl font-mono font-bold text-white group-hover:text-amber-400">
                                    {company.count}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-end justify-between">
                            <div>
                                <h3 className="font-bold text-white text-lg truncate max-w-[150px]">{company._id}</h3>
                                <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1 group-hover:text-amber-500/80 transition-colors">
                                    <Activity className="w-3 h-3" /> High Demand
                                </p>
                            </div>
                            <div className="p-2 rounded-full bg-zinc-800 text-zinc-400 group-hover:bg-amber-500 group-hover:text-black transition-all -rotate-45 group-hover:rotate-0">
                                <ArrowUpRight className="w-4 h-4" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Ticker for the rest */}
            {sorted.length > 4 && (
                <div className="mt-6 pt-6 border-t border-zinc-800/50 flex overflow-hidden">
                    <div className="flex animate-marquee gap-8 whitespace-nowrap hover:paused">
                        {[...sorted.slice(4), ...sorted.slice(4)].map((company, i) => (
                            <Link
                                key={`${company._id}-${i}`}
                                href={`/jobs?q=${company._id}`}
                                className="flex items-center gap-3 text-zinc-500 hover:text-white group transition-colors"
                            >
                                <span className="font-bold text-sm tracking-wide group-hover:text-amber-400">{company._id}</span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:border-amber-500/30">
                                    +{company.count}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
