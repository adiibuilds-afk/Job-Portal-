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
                {sorted.slice(0, 4).map((company, idx) => {
                    const maxCount = sorted[0]?.count || 1;
                    const heatPercent = Math.max(20, (company.count / maxCount) * 100);
                    const rankColors = ['text-amber-400', 'text-zinc-300', 'text-orange-400', 'text-zinc-500'];

                    return (
                        <Link
                            href={`/jobs?q=${company._id}`}
                            key={company._id}
                            className="group relative overflow-hidden bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 hover:border-amber-500/50 rounded-2xl p-5 transition-all hover:bg-zinc-900 hover:shadow-xl hover:shadow-amber-500/5"
                        >
                            {/* Rank Badge */}
                            <div className={`absolute top-3 right-3 w-7 h-7 rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-xs font-black ${rankColors[idx]}`}>
                                #{idx + 1}
                            </div>

                            {/* Heat Bar (bottom) */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 group-hover:opacity-100 opacity-70"
                                    style={{ width: `${heatPercent}%` }}
                                />
                            </div>

                            {/* Company Initial Avatar */}
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center font-black text-2xl text-zinc-500 group-hover:text-amber-400 group-hover:border-amber-500/30 transition-all duration-300 shadow-lg shadow-black/30 mb-4">
                                {company._id[0].toUpperCase()}
                            </div>

                            {/* Company Info */}
                            <h3 className="font-bold text-white text-lg truncate max-w-[90%] mb-1 group-hover:text-amber-400 transition-colors">
                                {company._id}
                            </h3>

                            <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-wide">
                                        {company.count} {company.count === 1 ? 'Opening' : 'Openings'}
                                    </span>
                                    {idx === 0 && (
                                        <span className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                                            <TrendingUp className="w-2.5 h-2.5" /> Top
                                        </span>
                                    )}
                                </div>
                                <div className="p-1.5 rounded-full bg-zinc-800 text-zinc-500 group-hover:bg-amber-500 group-hover:text-black transition-all">
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </Link>
                    );
                })}
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
