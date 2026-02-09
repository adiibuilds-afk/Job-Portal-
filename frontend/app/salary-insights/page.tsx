"use client";

import { useEffect, useState, Suspense } from 'react';
import Footer from '@/components/Footer';
import SalaryChart from '@/components/analytics/SalaryChart';
import axios from 'axios';
import { TrendingUp, Award, DollarSign } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jobgrid-in.onrender.com';

const CAREER_LEVELS = [
    { level: 'Entry Level', years: '0-2 Yrs', role: 'SDE I / Junior Dev', range: '4-12 LPA', color: 'from-blue-500 to-cyan-500' },
    { level: 'Mid Level', years: '2-5 Yrs', role: 'SDE II / Senior Dev', range: '12-25 LPA', color: 'from-amber-500 to-orange-500' },
    { level: 'Senior Level', years: '5-8 Yrs', role: 'Tech Lead / Staff Eng', range: '25-45 LPA', color: 'from-green-500 to-emerald-500' },
    { level: 'Leadership', years: '8+ Yrs', role: 'EM / Principal / CTO', range: '45+ LPA', color: 'from-purple-500 to-indigo-500' },
];

export default function SalaryInsightsPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/analytics/salary`);
                setData(res.data);
            } catch (err) {
                console.error("Failed to fetch salary stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <main className="min-h-screen bg-black text-white selection:bg-amber-500/30">

            <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
                {/* Hero */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 flex items-center justify-center gap-4">
                        <DollarSign className="w-12 h-12 text-amber-500" />
                        Salary Insights
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        Real-time data aggregated from thousands of job listings. Know your worth and plan your career trajectory.
                    </p>
                </div>

                {/* Primary Chart Section */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-16 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none"></div>

                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <TrendingUp className="w-6 h-6 text-amber-400" />
                                Average Salary by Role
                            </h2>
                            <p className="text-zinc-500">Based on Minimum Base Pay (LPA)</p>
                        </div>
                    </div>

                    <div className="min-h-[400px]">
                        {loading ? (
                            <div className="flex items-center justify-center h-[400px]">
                                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <SalaryChart data={data} />
                        )}
                    </div>
                </div>

                {/* Career Roadmap */}
                <div>
                    <h2 className="text-3xl font-black mb-10 text-center flex items-center justify-center gap-3">
                        <Award className="w-8 h-8 text-amber-500" />
                        Software Engineering Career Path
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {CAREER_LEVELS.map((level, i) => (
                            <div key={i} className="relative group">
                                {/* Connector Line (Desktop) */}
                                {i < CAREER_LEVELS.length - 1 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-[2px] bg-zinc-800 z-0"></div>
                                )}

                                <div className="relative z-10 bg-zinc-900 p-6 rounded-2xl border border-zinc-800 hover:-translate-y-2 hover:border-amber-500/50 transition-all duration-300">
                                    <div className={`h-2 w-16 mb-4 rounded-full bg-gradient-to-r ${level.color}`}></div>
                                    <h3 className="text-lg font-bold text-white mb-1">{level.level}</h3>
                                    <div className="text-zinc-500 text-sm font-mono mb-4">{level.years}</div>

                                    <div className="space-y-2">
                                        <div className="bg-black/40 p-3 rounded-lg border border-zinc-800/50">
                                            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Role</div>
                                            <div className="font-semibold text-zinc-200 text-sm">{level.role}</div>
                                        </div>
                                        <div className="bg-black/40 p-3 rounded-lg border border-zinc-800/50">
                                            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Expected Pay</div>
                                            <div className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400">
                                                {level.range}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
            <Footer />
        </main>
    );
}
