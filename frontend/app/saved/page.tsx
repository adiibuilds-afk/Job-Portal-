"use client";

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import JobCard from '@/components/JobCard';
import { useSavedJobs } from '@/hooks/useSavedJobs';
import { getJobs } from '@/services/api';
import { Job } from '@/types';
import { Bookmark, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SavedJobsPage() {
    const { savedIds } = useSavedJobs();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSavedJobs = async () => {
            if (savedIds.length === 0) {
                setJobs([]);
                setLoading(false);
                return;
            }

            try {
                // Fetch jobs by IDs using the new API filter
                const res: any = await getJobs({ ids: savedIds });

                // Handle response format
                let fetchedJobs: Job[] = [];
                if (Array.isArray(res)) {
                    fetchedJobs = res;
                } else if (res.jobs) {
                    fetchedJobs = res.jobs;
                }

                setJobs(fetchedJobs);
            } catch (error) {
                console.error("Failed to fetch saved jobs", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSavedJobs();
    }, [savedIds]); // Re-fetch if saved IDs change (e.g. unbookmarking)

    return (
        <main className="min-h-screen bg-black">
            <Navbar />

            {/* Header */}
            <section className="pt-32 pb-10 px-6 border-b border-zinc-800">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Bookmark className="w-6 h-6 text-amber-500" />
                        </div>
                        <h1 className="text-4xl font-black text-white">Saved Jobs</h1>
                    </div>
                    <p className="text-zinc-400">You have {savedIds.length} bookmarked opportunities</p>
                </div>
            </section>

            {/* Jobs Grid */}
            <section className="py-10 px-6">
                <div className="max-w-6xl mx-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                        </div>
                    ) : jobs.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-5">
                            {jobs.map((job, idx) => (
                                <JobCard key={job._id} job={job} index={idx} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center border border-zinc-800 rounded-2xl bg-zinc-900/30">
                            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                                <Bookmark className="w-8 h-8 text-zinc-600" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No Saved Jobs Yet</h3>
                            <p className="text-zinc-500 mb-8">Start exploring opportunities and save them for later!</p>
                            <Link
                                href="/jobs"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Browse Jobs
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}
