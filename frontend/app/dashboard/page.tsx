"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import axios from "axios";
import { getPublicStats } from '@/services/api';
import { TrendingUp, Briefcase, Building2, Code, Users, Globe, Laptop, BookmarkCheck, LayoutDashboard, Sparkles, LogOut, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HiringHeatmap from "@/components/home/HiringHeatmap";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);
    const [marketStats, setMarketStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'tracker' | 'insights'>('tracker');
    const [activeTrackerTab, setActiveTrackerTab] = useState<'applied' | 'saved'>('applied');

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        } else if (session?.user?.email) {
            Promise.all([fetchUserData(), fetchMarketStats()]).finally(() => setLoading(false));
        }
    }, [status, session, router]);

    const fetchUserData = async () => {
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile?email=${session?.user?.email}`);
            const user = data.user;

            // Filter out null/deleted jobs
            if (user.appliedJobs) {
                user.appliedJobs = user.appliedJobs.filter((a: any) => a.jobId);
            }
            if (user.savedJobs) {
                user.savedJobs = user.savedJobs.filter((s: any) => s);
            }

            setUserData(user);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMarketStats = async () => {
        try {
            const data = await getPublicStats();
            setMarketStats(data);
        } catch (error) {
            console.error(error);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <LayoutDashboard className="w-4 h-4 text-amber-500" />
                    </div>
                </div>
            </div>
        );
    }

    if (!session) return null;

    return (
        <main className="min-h-screen bg-black text-white selection:bg-amber-500 selection:text-black">
            <Suspense fallback={null}>
                <Navbar />
            </Suspense>

            <div className="max-w-7xl mx-auto px-4 pt-32 pb-20">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">Active Hub</span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tight mb-2">My <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">Workspace</span></h1>
                        <p className="text-zinc-500 font-medium">Manage your career growth and track your progress.</p>
                    </div>

                    <div className="flex bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800">
                        <button
                            onClick={() => setActiveTab('tracker')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'tracker'
                                ? 'bg-zinc-800 text-white shadow-xl border border-zinc-700'
                                : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <BookmarkCheck className="w-4 h-4" />
                            Activity Tracker
                        </button>
                        <button
                            onClick={() => setActiveTab('insights')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'insights'
                                ? 'bg-zinc-800 text-white shadow-xl border border-zinc-700'
                                : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <TrendingUp className="w-4 h-4" />
                            Market Insights
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'tracker' ? (
                        <motion.div
                            key="tracker"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <ActivityCard title="Applied" value={userData?.appliedJobs?.length || 0} icon={<Briefcase className="w-5 h-5" />} color="text-blue-400" />
                                <ActivityCard title="Saved" value={userData?.savedJobs?.length || 0} icon={<StarIcon className="w-5 h-5" />} color="text-amber-400" />
                                <ActivityCard title="Profile Rank" value="Top 15%" icon={<Sparkles className="w-5 h-5" />} color="text-purple-400" />
                                <ActivityCard title="Batch" value={userData?.batch || '2025'} icon={<Users className="w-5 h-5" />} color="text-green-400" />
                            </div>

                            {/* Job Tracker Section */}
                            <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 min-h-[500px]">
                                <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-6">
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setActiveTrackerTab('applied')}
                                            className={`text-lg font-bold transition-all ${activeTrackerTab === 'applied' ? 'text-white underline decoration-amber-500 decoration-4 underline-offset-8' : 'text-zinc-500 hover:text-zinc-300'}`}
                                        >
                                            Applied Jobs
                                        </button>
                                        <button
                                            onClick={() => setActiveTrackerTab('saved')}
                                            className={`text-lg font-bold transition-all ${activeTrackerTab === 'saved' ? 'text-white underline decoration-amber-500 decoration-4 underline-offset-8' : 'text-zinc-500 hover:text-zinc-300'}`}
                                        >
                                            Saved Jobs
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => router.push('/jobs')}
                                        className="text-amber-400 text-sm font-bold flex items-center gap-1 hover:underline"
                                    >
                                        Find more <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {activeTrackerTab === 'applied' && userData?.appliedJobs?.map((item: any) => (
                                        <DashboardJobCard key={item._id} job={item.jobId} appliedAt={item.appliedAt} type="applied" />
                                    ))}
                                    {activeTrackerTab === 'saved' && userData?.savedJobs?.map((job: any) => (
                                        <DashboardJobCard key={job._id} job={job} type="saved" />
                                    ))}

                                    {activeTrackerTab === 'applied' && (!userData?.appliedJobs || userData.appliedJobs.length === 0) && (
                                        <EmptyState message="You haven't applied to any jobs yet." cta="Browse Jobs" />
                                    )}
                                    {activeTrackerTab === 'saved' && (!userData?.savedJobs || userData.savedJobs.length === 0) && (
                                        <EmptyState message="Your wishlist is empty." cta="Add Jobs" />
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="insights"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            {/* Market Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard title="Active Listings" value={marketStats?.totalJobs || 0} icon={<Briefcase className="text-amber-500" />} color="bg-amber-500/10" />
                                <StatCard title="New This Week" value={marketStats?.newThisWeek || 0} icon={<TrendingUp className="text-green-500" />} color="bg-green-500/10" />
                                <StatCard title="Remote Roles" value={marketStats?.remoteCount || 0} icon={<Globe className="text-blue-500" />} color="bg-blue-500/10" />
                                <StatCard title="Companies" value={marketStats?.topCompanies?.length || 0} icon={<Building2 className="text-purple-500" />} color="bg-purple-500/10" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <ChartPanel title="Hiring by Role Type" icon={<Users className="w-5 h-5 text-green-400" />} data={marketStats?.roleTypeStats || []} total={marketStats?.totalJobs} />
                                <ChartPanel title="Trending Skills" icon={<Code className="w-5 h-5 text-blue-400" />} data={marketStats?.popularTags || []} total={marketStats?.totalJobs} isTags />
                            </div>

                            <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8">
                                <HiringHeatmap />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <Footer />
        </main>
    );
}

function DashboardJobCard({ job, appliedAt, type }: { job: any, appliedAt?: string, type: 'applied' | 'saved' }) {
    if (!job) return null;
    return (
        <div className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-amber-500/30 transition-all hover:bg-zinc-800/50 flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">{job.title}</h3>
                    <p className="text-zinc-400 text-sm uppercase font-mono tracking-tighter">{job.company}</p>
                </div>
                {type === 'applied' && (
                    <span className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase rounded-lg border border-green-500/20">Applied</span>
                )}
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-2 py-1 bg-zinc-800 text-zinc-400 text-[10px] font-bold rounded-md border border-zinc-700/50">{job.location}</span>
                <span className="px-2 py-1 bg-zinc-800 text-zinc-400 text-[10px] font-bold rounded-md border border-zinc-700/50">{(job.batch || []).slice(0, 1)} Batch</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-auto pt-4 border-t border-zinc-800">
                <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-zinc-700" />
                    {type === 'applied' ? `Applied on ${new Date(appliedAt!).toLocaleDateString()}` : `Posted ${new Date(job.createdAt).toLocaleDateString()}`}
                </span>
                <a href={`/job/${job.slug}`} className="text-white hover:text-amber-400 font-bold">View Detail</a>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }: any) {
    return (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}>{icon}</div>
            <h3 className="text-3xl font-black text-white mb-1">{value}</h3>
            <p className="text-zinc-500 font-bold text-sm">{title}</p>
        </div>
    );
}

function ActivityCard({ title, value, icon, color }: any) {
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className={`${color} mb-4`}>{icon}</div>
            <h3 className="text-3xl font-black text-white mb-1">{value}</h3>
            <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest">{title}</p>
        </div>
    );
}

function ChartPanel({ title, icon, data, total, isTags }: any) {
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">{icon} {title}</h3>
            <div className="space-y-4">
                {data.map((item: any) => (
                    <div key={item._id} className="flex flex-col gap-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-300 font-medium">{item._id || 'General'}</span>
                            <span className="text-white font-bold">{item.count}</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(item.count / total) * 100}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function EmptyState({ message, cta }: any) {
    const router = useRouter();
    return (
        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-40">
            <LayoutDashboard className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium mb-4">{message}</p>
            <button onClick={() => router.push('/jobs')} className="text-amber-500 font-bold hover:underline">{cta}</button>
        </div>
    );
}

function StarIcon({ className }: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    )
}
