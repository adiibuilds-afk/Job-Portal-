"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import axios from "axios";

import EditProfileModal from "@/components/profile/EditProfileModal";
import { User as UserIcon, Mail, GraduationCap, MapPin, Calendar, Edit3, Shield, Star } from "lucide-react";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
        <main className="min-h-screen bg-black text-white selection:bg-amber-500 selection:text-black">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 pt-32 pb-20">
                {/* Hero Profile Section */}
                <div className="relative mb-12">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent blur-3xl -z-10" />

                    <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] backdrop-blur-xl">
                        <div className="relative group">
                            {session.user?.image ? (
                                <img
                                    src={session.user.image}
                                    alt="Profile"
                                    className="w-40 h-40 rounded-[2rem] object-cover border-2 border-zinc-800 group-hover:border-amber-500/50 transition-all duration-500"
                                />
                            ) : (
                                <div className="w-40 h-40 rounded-[2rem] bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-5xl font-black text-amber-500 border-2 border-zinc-800 group-hover:border-amber-500/50 transition-all">
                                    {session.user?.name?.charAt(0) || 'U'}
                                </div>
                            )}
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 text-black">
                                <Shield className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                                <h1 className="text-4xl font-black tracking-tight">{session.user?.name}</h1>
                                <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest rounded-full border border-amber-500/20">
                                    Verified Member
                                </span>
                            </div>
                            <div className="flex flex-col md:flex-row gap-4 text-zinc-400 font-medium mb-6">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-zinc-600" />
                                    {session.user?.email}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-zinc-600" />
                                    {userData?.location || "Not Set"}
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-amber-500 transition-all hover:scale-105 active:scale-95"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    Edit Profile
                                </button>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="px-6 py-2.5 bg-zinc-800 text-zinc-400 font-bold rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all border border-zinc-700"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Details Column */}
                    <div className="md:col-span-2 space-y-8">
                        <section className="bg-zinc-900/40 border border-zinc-800 rounded-[2rem] p-8">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <GraduationCap className="w-5 h-5 text-amber-500" />
                                Educational Background
                            </h3>
                            <div className="space-y-6">
                                <div className="flex gap-4 p-4 bg-zinc-800/20 rounded-2xl border border-zinc-800/50">
                                    <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
                                        <GraduationCap className="w-6 h-6 text-zinc-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-lg">{userData?.degree || "Not Specified"}</h4>
                                        <p className="text-zinc-500">Qualification</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 p-4 bg-zinc-800/20 rounded-2xl border border-zinc-800/50">
                                    <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-zinc-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-lg">{userData?.batch || "Not Specified"} Batch</h4>
                                        <p className="text-zinc-500">Graduation Year</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-zinc-900/40 border border-zinc-800 rounded-[2rem] p-8">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <Star className="w-5 h-5 text-amber-500" />
                                Quick Links
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="p-6 bg-zinc-800/40 border border-zinc-800 rounded-2xl hover:border-amber-500/30 transition-all text-left group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold block text-white">My Dashboard</span>
                                    <span className="text-xs text-zinc-500">Applications & Tracking</span>
                                </button>
                                <button
                                    onClick={() => router.push('/saved')}
                                    className="p-6 bg-zinc-800/40 border border-zinc-800 rounded-2xl hover:border-amber-500/30 transition-all text-left group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                                        <Star className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold block text-white">Saved Jobs</span>
                                    <span className="text-xs text-zinc-500">Wishlisted Roles</span>
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* Stats/Badge Column */}
                    <div className="space-y-8">
                        <div className="bg-gradient-to-br from-amber-500 to-yellow-600 rounded-[2rem] p-8 text-black shadow-2xl shadow-amber-500/10">
                            <h3 className="text-2xl font-black mb-4 leading-tight text-black">Member Since</h3>
                            <div className="text-5xl font-black mb-1">
                                {new Date(userData?.createdAt || Date.now()).getFullYear()}
                            </div>
                            <p className="text-black/60 font-medium">Standard License</p>
                        </div>

                        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Account Status</span>
                                <div className="flex h-2 w-2 relative">
                                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
                                    <div className="bg-green-500 rounded-full h-2 w-2 relative" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                                    <span className="text-zinc-400">Email Status</span>
                                    <span className="text-green-500 font-bold text-sm">Active</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                                    <span className="text-zinc-400">Jobs Tracking</span>
                                    <span className="text-zinc-200 font-bold text-sm">Enabled</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-zinc-400">Security</span>
                                    <span className="text-zinc-200 font-bold text-sm">Normal</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={{ ...userData, email: session.user?.email }}
                onUpdate={fetchUserData}
            />
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
