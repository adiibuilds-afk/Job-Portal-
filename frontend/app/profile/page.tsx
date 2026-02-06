"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import axios from "axios";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'applied' | 'saved'>('applied');

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        } else if (session?.user?.email) {
            fetchUserData();
        }
    }, [status, session, router]);

    const fetchUserData = async () => {
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile?email=${session?.user?.email}`);
            setUserData(data.user);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    if (!session) return null;

    return (
        <main className="min-h-screen bg-black text-white">
            <Navbar />
            <div className="max-w-5xl mx-auto px-4 pt-32 pb-20">
                {/* Profile Header */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 mb-8 backdrop-blur-xl">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {session.user?.image ? (
                            <img
                                src={session.user.image}
                                alt="Profile"
                                className="w-32 h-32 rounded-full border-4 border-amber-500/20 shadow-2xl shadow-amber-500/10"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-4xl font-bold text-black border-4 border-amber-500/20 shadow-2xl shadow-amber-500/10">
                                {session.user?.name?.charAt(0) || 'U'}
                            </div>
                        )}
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-4xl font-bold text-white mb-2">{session.user?.name}</h1>
                            <p className="text-zinc-400 text-lg mb-4">{session.user?.email}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <div className="px-5 py-2 rounded-full bg-zinc-800 text-zinc-300 text-sm font-medium border border-zinc-700">
                                    🎓 {userData?.degree || "Student"}
                                </div>
                                <div className="px-5 py-2 rounded-full bg-zinc-800 text-zinc-300 text-sm font-medium border border-zinc-700">
                                    📍 {userData?.location || "India"}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all font-bold text-sm"
                            >
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
                        <p className="text-zinc-500 text-sm mb-1">Applied Jobs</p>
                        <p className="text-3xl font-bold text-white">{userData?.appliedJobs?.length || 0}</p>
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
                        <p className="text-zinc-500 text-sm mb-1">Saved Jobs</p>
                        <p className="text-3xl font-bold text-white">{userData?.savedJobs?.length || 0}</p>
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
                        <p className="text-zinc-500 text-sm mb-1">Profile Views</p>
                        <p className="text-3xl font-bold text-white">14</p>
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
                        <p className="text-zinc-500 text-sm mb-1">Match Score</p>
                        <p className="text-3xl font-bold text-green-400">High</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-zinc-900/50 p-1 rounded-2xl mb-8 border border-zinc-800 w-fit">
                    <button
                        onClick={() => setActiveTab('applied')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'applied'
                                ? 'bg-zinc-800 text-white shadow-lg'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        Applied Jobs ({userData?.appliedJobs?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'saved'
                                ? 'bg-zinc-800 text-white shadow-lg'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        Saved Jobs ({userData?.savedJobs?.length || 0})
                    </button>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {activeTab === 'applied' && userData?.appliedJobs?.map((item: any) => (
                        <DashboardJobCard key={item._id} job={item.jobId} appliedAt={item.appliedAt} type="applied" />
                    ))}
                    {activeTab === 'saved' && userData?.savedJobs?.map((job: any) => (
                        <DashboardJobCard key={job._id} job={job} type="saved" />
                    ))}

                    {(activeTab === 'applied' && (!userData?.appliedJobs || userData.appliedJobs.length === 0)) && (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-zinc-500 mb-4">You haven't applied to any jobs yet.</p>
                            <button onClick={() => router.push('/jobs')} className="text-amber-400 font-bold hover:underline">Find Jobs</button>
                        </div>
                    )}

                    {(activeTab === 'saved' && (!userData?.savedJobs || userData.savedJobs.length === 0)) && (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-zinc-500 mb-4">No saved jobs found.</p>
                            <button onClick={() => router.push('/jobs')} className="text-amber-400 font-bold hover:underline">Browse Jobs</button>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </main>
    );
}

function DashboardJobCard({ job, appliedAt, type }: { job: any, appliedAt?: string, type: 'applied' | 'saved' }) {
    if (!job) return null;

    return (
        <div className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-amber-500/30 transition-all hover:bg-zinc-800/50">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">{job.title}</h3>
                    <p className="text-zinc-400 text-sm">{job.company}</p>
                </div>
                {type === 'applied' && (
                    <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-lg border border-green-500/20">
                        Applied
                    </span>
                )}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
                {job.batch?.slice(0, 2).map((b: string) => (
                    <span key={b} className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-md">
                        {b}
                    </span>
                ))}
                <span className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-md">
                    {job.location}
                </span>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-500 mt-auto pt-4 border-t border-zinc-800">
                <span>
                    {type === 'applied' ? `Applied on ${new Date(appliedAt!).toLocaleDateString()}` : `Posted ${new Date(job.createdAt).toLocaleDateString()}`}
                </span>
                <a href={`/job/${job.slug}`} className="text-white hover:text-amber-400 font-medium">View Details &rarr;</a>
            </div>
        </div>
    );
}
