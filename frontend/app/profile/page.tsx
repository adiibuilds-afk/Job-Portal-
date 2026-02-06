"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import axios from "axios";
import Link from "next/link";

import EditProfileModal from "@/components/profile/EditProfileModal";
import { User as UserIcon, Mail, GraduationCap, MapPin, Calendar, Edit3, Shield, Star, Coins, Briefcase, ExternalLink, Code, Globe, TrendingUp, Zap, Crown, Award, ArrowRight } from "lucide-react";
import { motion } from 'framer-motion';

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);
    const [coinsData, setCoinsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        } else if (session?.user?.email) {
            fetchAllData();
        }
    }, [status, session, router]);

    const fetchAllData = async () => {
        try {
            const [userRes, coinsRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile?email=${session?.user?.email}`),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/user/coins?email=${session?.user?.email}`)
            ]);
            setUserData(userRes.data.user);
            setCoinsData(coinsRes.data);
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

    const TIER_ICONS: Record<string, any> = { Bronze: Award, Silver: Award, Gold: Crown, Diamond: Crown };
    const TIER_COLORS: Record<string, string> = { Bronze: 'text-orange-400', Silver: 'text-zinc-300', Gold: 'text-amber-400', Diamond: 'text-blue-400' };
    const UserTierIcon = TIER_ICONS[coinsData?.tier || 'Bronze'];
    const appliedCount = userData?.appliedJobs?.filter((a: any) => a?.jobId)?.length || 0;
    const savedCount = userData?.savedJobs?.filter((s: any) => s)?.length || 0;

    return (
        <main className="min-h-screen bg-black text-white selection:bg-amber-500 selection:text-black">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 pt-32 pb-20">
                {/* Hero Profile Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative mb-10"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent blur-3xl -z-10" />

                    <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] backdrop-blur-xl">
                        <div className="relative group">
                            {session.user?.image ? (
                                <img
                                    src={session.user.image}
                                    alt="Profile"
                                    className="w-36 h-36 rounded-[2rem] object-cover border-2 border-zinc-800 group-hover:border-amber-500/50 transition-all duration-500 shadow-xl shadow-black/50"
                                />
                            ) : (
                                <div className="w-36 h-36 rounded-[2rem] bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-5xl font-black text-amber-500 border-2 border-zinc-800 group-hover:border-amber-500/50 transition-all shadow-xl shadow-black/50">
                                    {session.user?.name?.charAt(0) || 'U'}
                                </div>
                            )}
                            <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 text-black">
                                <Shield className="w-4 h-4" />
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                                <h1 className="text-4xl font-black tracking-tight">{session.user?.name}</h1>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-800/80 rounded-full border border-zinc-700 text-xs font-bold ${TIER_COLORS[coinsData?.tier || 'Bronze']}`}>
                                    <UserTierIcon className="w-3.5 h-3.5" />
                                    {coinsData?.tier || 'Bronze'} Member
                                </span>
                            </div>
                            <div className="flex flex-col md:flex-row gap-x-6 gap-y-1 text-zinc-400 font-medium mb-5 text-sm">
                                <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-zinc-600" />{session.user?.email}</span>
                                <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-zinc-600" />{userData?.location || "India"}</span>
                                <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-zinc-600" />Batch of {userData?.batch || 'N/A'}</span>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-amber-500 transition-all hover:scale-105 active:scale-95 text-sm"
                                >
                                    <Edit3 className="w-4 h-4" /> Edit Profile
                                </button>
                                <Link
                                    href="/dashboard?tab=coins"
                                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-500/10 text-amber-500 font-bold rounded-xl border border-amber-500/20 hover:bg-amber-500/20 transition-all text-sm"
                                >
                                    <Coins className="w-4 h-4" /> {coinsData?.balance?.toFixed(1) || 0} Coins
                                </Link>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="px-5 py-2.5 bg-zinc-800 text-zinc-400 font-bold rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all border border-zinc-700 text-sm"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <StatBox icon={<Briefcase className="w-5 h-5 text-green-400" />} value={appliedCount} label="Applications" color="bg-green-500/10" />
                    <StatBox icon={<Star className="w-5 h-5 text-amber-400" />} value={savedCount} label="Saved Jobs" color="bg-amber-500/10" />
                    <StatBox icon={<Coins className="w-5 h-5 text-yellow-400" />} value={coinsData?.balance?.toFixed(0) || 0} label="Grid Coins" color="bg-yellow-500/10" />
                    <StatBox icon={<TrendingUp className="w-5 h-5 text-blue-400" />} value={coinsData?.loginStreak || 0} label="Day Streak" color="bg-blue-500/10" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Skills Section */}
                        <section className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8">
                            <h3 className="text-lg font-bold mb-5 flex items-center gap-3">
                                <Code className="w-5 h-5 text-amber-500" /> Skills & Expertise
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {(coinsData?.skills && coinsData.skills.length > 0) ? (
                                    coinsData.skills.map((skill: string, i: number) => (
                                        <span key={i} className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm font-medium rounded-lg">{skill}</span>
                                    ))
                                ) : (
                                    <p className="text-zinc-500 text-sm">No skills added yet. <button onClick={() => setIsEditModalOpen(true)} className="text-amber-500 hover:underline font-bold">Add now</button> to earn coins! 🪙</p>
                                )}
                            </div>
                        </section>

                        {/* Education Section */}
                        <section className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8">
                            <h3 className="text-lg font-bold mb-5 flex items-center gap-3">
                                <GraduationCap className="w-5 h-5 text-amber-500" /> Education
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex gap-4 p-4 bg-zinc-800/30 rounded-2xl border border-zinc-800/50">
                                    <div className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0"><GraduationCap className="w-5 h-5 text-zinc-500" /></div>
                                    <div><h4 className="font-bold text-white">{userData?.degree || "Not Specified"}</h4><p className="text-zinc-500 text-sm">Qualification</p></div>
                                </div>
                                <div className="flex gap-4 p-4 bg-zinc-800/30 rounded-2xl border border-zinc-800/50">
                                    <div className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0"><Calendar className="w-5 h-5 text-zinc-500" /></div>
                                    <div><h4 className="font-bold text-white">{userData?.batch || "N/A"} Batch</h4><p className="text-zinc-500 text-sm">Graduation Year</p></div>
                                </div>
                            </div>
                        </section>

                        {/* Portfolio Section */}
                        <section className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8">
                            <h3 className="text-lg font-bold mb-5 flex items-center gap-3">
                                <Globe className="w-5 h-5 text-amber-500" /> Portfolio & Links
                            </h3>
                            {(userData?.portfolioUrl || coinsData?.portfolioUrl) ? (
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-zinc-800 border border-zinc-700">
                                        <Globe className="w-6 h-6 text-zinc-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Personal Website / GitHub</p>
                                        <a
                                            href={userData?.portfolioUrl || coinsData?.portfolioUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 group truncate"
                                        >
                                            {userData?.portfolioUrl || coinsData?.portfolioUrl}
                                            <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-800/10">
                                    <Globe className="w-8 h-8 text-zinc-700 mb-3" />
                                    <p className="text-zinc-500 text-sm mb-4 text-center">No portfolio linked yet.</p>
                                    <button
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="px-4 py-2 bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 rounded-xl text-xs font-bold transition-all"
                                    >
                                        Add Link (+2 Coins 🪙)
                                    </button>
                                </div>
                            )}
                        </section>

                        {/* Quick Links */}
                        <section className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8">
                            <h3 className="text-lg font-bold mb-5 flex items-center gap-3">
                                <Zap className="w-5 h-5 text-amber-500" /> Quick Actions
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <Link href="/dashboard" className="p-5 bg-zinc-800/40 border border-zinc-800 rounded-2xl hover:border-amber-500/30 transition-all group flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-colors"><Briefcase className="w-5 h-5" /></div>
                                    <div><span className="font-bold block text-white">Dashboard</span><span className="text-xs text-zinc-500">Track applications</span></div>
                                </Link>
                                <Link href="/jobs" className="p-5 bg-zinc-800/40 border border-zinc-800 rounded-2xl hover:border-amber-500/30 transition-all group flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-colors"><Star className="w-5 h-5" /></div>
                                    <div><span className="font-bold block text-white">Browse Jobs</span><span className="text-xs text-zinc-500">Find new roles</span></div>
                                </Link>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Member Card */}
                        <div className="bg-gradient-to-br from-amber-500 to-yellow-600 rounded-[2rem] p-7 text-black shadow-2xl shadow-amber-500/10">
                            <h3 className="text-xl font-black mb-3 leading-tight">Member Since</h3>
                            <div className="text-5xl font-black mb-1">{new Date(userData?.createdAt || Date.now()).getFullYear()}</div>
                            <p className="text-black/60 font-medium text-sm">Standard License</p>
                        </div>

                        {/* Grid Coins CTA */}
                        <Link href="/dashboard?tab=coins" className="block bg-zinc-900 border border-zinc-800 rounded-[2rem] p-7 hover:border-amber-500/30 transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Grid Coins</span>
                                <Coins className="w-5 h-5 text-amber-500" />
                            </div>
                            <div className="text-4xl font-black text-white mb-1 flex items-center gap-2">
                                {coinsData?.balance?.toFixed(1) || 0} <span className="text-xl">🪙</span>
                            </div>
                            <p className="text-zinc-500 text-sm mb-4">Earn coins to unlock perks!</p>
                            <div className="flex items-center text-amber-500 font-bold text-sm group-hover:gap-2 transition-all">
                                View Economy <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>

                        {/* Badges */}
                        {(coinsData?.badges && coinsData.badges.length > 0) && (
                            <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-7">
                                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Badges</h3>
                                <div className="flex flex-wrap gap-2">
                                    {coinsData.badges.map((badge: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold rounded-full uppercase tracking-wide">{badge}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Account Status */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-7">
                            <div className="flex items-center justify-between mb-5">
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Account Status</span>
                                <div className="flex h-2 w-2 relative"><div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" /><div className="bg-green-500 rounded-full h-2 w-2 relative" /></div>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center py-2 border-b border-zinc-800"><span className="text-zinc-400">Email</span><span className="text-green-500 font-bold">Verified</span></div>
                                <div className="flex justify-between items-center py-2 border-b border-zinc-800"><span className="text-zinc-400">Referrals</span><span className="text-zinc-200 font-bold">{coinsData?.referralCount || 0}</span></div>
                                <div className="flex justify-between items-center py-2"><span className="text-zinc-400">Auth</span><span className="text-zinc-200 font-bold">Google Login</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={{ ...userData, email: session.user?.email }}
                onUpdate={fetchAllData}
            />
            <Footer />
        </main>
    );
}

function StatBox({ icon, value, label, color }: { icon: any, value: number | string, label: string, color: string }) {
    return (
        <div className={`${color} bg-opacity-10 border border-zinc-800 rounded-2xl p-5`}>
            <div className="mb-3">{icon}</div>
            <div className="text-2xl font-black text-white">{value}</div>
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wide">{label}</div>
        </div>
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
