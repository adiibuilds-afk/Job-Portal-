import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getPublicStats } from '@/services/api';
import { TrendingUp, Briefcase, Building2, Code, Users, Globe, Laptop } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Job Market Dashboard | Engineering Jobs India',
    description: 'Real-time job market stats, trending skills, and hiring trends for engineering roles in India.',
};

export const dynamic = 'force-dynamic';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
}

function StatCard({ title, value, subtitle, icon, color }: StatCardProps) {
    return (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
            <h3 className="text-3xl font-black text-white mb-1">{value}</h3>
            <p className="text-zinc-400 font-medium">{title}</p>
            {subtitle && <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>}
        </div>
    );
}

export default async function DashboardPage() {
    let stats: any = {
        totalJobs: 0,
        newThisWeek: 0,
        jobTypeStats: [],
        roleTypeStats: [],
        popularTags: [],
        topCompanies: [],
        remoteCount: 0,
        onsiteCount: 0
    };

    try {
        stats = await getPublicStats();
    } catch (error) {
        console.error('Failed to fetch stats', error);
    }

    return (
        <main className="min-h-screen bg-black">
            <Navbar />

            {/* Header */}
            <section className="pt-32 pb-10 px-6 border-b border-zinc-800">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-black" />
                        </div>
                        <h1 className="text-4xl font-black text-white">Job Market Dashboard</h1>
                    </div>
                    <p className="text-zinc-400">Real-time insights into the engineering job market</p>
                </div>
            </section>

            {/* Stats Grid */}
            <section className="py-10 px-6">
                <div className="max-w-6xl mx-auto">

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        <StatCard
                            title="Total Jobs"
                            value={stats.totalJobs}
                            subtitle="Active listings"
                            icon={<Briefcase className="w-6 h-6 text-amber-500" />}
                            color="bg-amber-500/10"
                        />
                        <StatCard
                            title="New This Week"
                            value={stats.newThisWeek}
                            subtitle="Fresh opportunities"
                            icon={<TrendingUp className="w-6 h-6 text-green-500" />}
                            color="bg-green-500/10"
                        />
                        <StatCard
                            title="Remote Jobs"
                            value={stats.remoteCount}
                            subtitle="Work from anywhere"
                            icon={<Globe className="w-6 h-6 text-blue-500" />}
                            color="bg-blue-500/10"
                        />
                        <StatCard
                            title="On-Site Jobs"
                            value={stats.onsiteCount}
                            subtitle="Office-based roles"
                            icon={<Building2 className="w-6 h-6 text-purple-500" />}
                            color="bg-purple-500/10"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Job Types */}
                        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Laptop className="w-5 h-5 text-amber-400" />
                                By Job Type
                            </h3>
                            <div className="space-y-4">
                                {stats.jobTypeStats.map((item: any) => (
                                    <div key={item._id} className="flex items-center justify-between">
                                        <span className="text-zinc-300">{item._id || 'Unknown'}</span>
                                        <div className="flex items-center gap-3">
                                            <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full"
                                                    style={{ width: `${(item.count / stats.totalJobs) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-amber-400 font-bold w-8 text-right">{item.count}</span>
                                        </div>
                                    </div>
                                ))}
                                {stats.jobTypeStats.length === 0 && (
                                    <p className="text-zinc-500 text-sm">No data available yet</p>
                                )}
                            </div>
                        </div>

                        {/* Role Types */}
                        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Users className="w-5 h-5 text-green-400" />
                                By Role Type
                            </h3>
                            <div className="space-y-4">
                                {stats.roleTypeStats.map((item: any) => (
                                    <div key={item._id} className="flex items-center justify-between">
                                        <span className="text-zinc-300">{item._id || 'Unknown'}</span>
                                        <div className="flex items-center gap-3">
                                            <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                                                    style={{ width: `${(item.count / stats.totalJobs) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-green-400 font-bold w-8 text-right">{item.count}</span>
                                        </div>
                                    </div>
                                ))}
                                {stats.roleTypeStats.length === 0 && (
                                    <p className="text-zinc-500 text-sm">No data available yet</p>
                                )}
                            </div>
                        </div>

                        {/* Popular Tags */}
                        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Code className="w-5 h-5 text-blue-400" />
                                Trending Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {stats.popularTags.map((tag: any, idx: number) => (
                                    <span
                                        key={tag._id}
                                        className={`px-3 py-2 rounded-lg font-medium text-sm border ${idx === 0
                                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                                : idx < 3
                                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                            }`}
                                    >
                                        {tag._id} <span className="text-xs opacity-60">({tag.count})</span>
                                    </span>
                                ))}
                                {stats.popularTags.length === 0 && (
                                    <p className="text-zinc-500 text-sm">No skills data yet</p>
                                )}
                            </div>
                        </div>

                        {/* Top Companies */}
                        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-purple-400" />
                                Top Hiring Companies
                            </h3>
                            <div className="space-y-3">
                                {stats.topCompanies.map((company: any, idx: number) => (
                                    <div key={company._id} className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-amber-500 text-black' :
                                                idx === 1 ? 'bg-zinc-600 text-white' :
                                                    idx === 2 ? 'bg-amber-700 text-white' :
                                                        'bg-zinc-800 text-zinc-400'
                                            }`}>
                                            {idx + 1}
                                        </div>
                                        <span className="text-zinc-300 flex-1">{company._id}</span>
                                        <span className="text-purple-400 font-bold">{company.count} jobs</span>
                                    </div>
                                ))}
                                {stats.topCompanies.length === 0 && (
                                    <p className="text-zinc-500 text-sm">No company data yet</p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            <Footer />
        </main>
    );
}
