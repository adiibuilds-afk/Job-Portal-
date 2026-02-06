"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Building2, MapPin } from 'lucide-react';
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

    return (
        <section className="py-8 border-b border-zinc-800 bg-black/50 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-amber-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Who's Hiring This Week?</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {companies.map((company, idx) => (
                        <Link
                            href={`/jobs?q=${company._id}`}
                            key={company._id}
                            className="group relative bg-zinc-900 border border-zinc-800 p-4 rounded-xl hover:border-amber-500/50 transition-all hover:translate-y-[-2px] hover:shadow-lg hover:shadow-amber-500/10"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-xl font-bold text-zinc-500 group-hover:text-white transition-colors">
                                    {company._id[0]}
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${idx === 0 ? 'bg-green-500/10 text-green-400' : 'bg-zinc-800 text-zinc-400'}`}>
                                    {company.count} Openings
                                </span>
                            </div>
                            <h3 className="font-bold text-white truncate">{company._id}</h3>
                            <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                                <Building2 className="w-3 h-3" /> View Jobs
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
