"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import JobCard from '@/components/JobCard';
import { notFound } from 'next/navigation';
import Head from 'next/head';

// Helper to format slug: "bangalore-jobs" -> "Bangalore"
const formatSlug = (slug: string) => {
    return slug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
        .replace(' Jobs', ''); // cleanup common suffix
};

export default function SEOJobPage({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const formattedKeyword = formatSlug(slug);

    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchJobs();
    }, [slug]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            // Smart Match Strategy:
            // 1. Try fetching by Location (e.g. Bangalore)
            // 2. Try fetching by Role (e.g. Frontend)
            // 3. Try fetching by generic query

            // We'll run parallel queries to see what hits. 
            // In a pro setup, we'd have a map, but this is "Programmatic".

            const [locRes, roleRes, qRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs?location=${formattedKeyword}`),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs?roleType=${formattedKeyword}`),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs?q=${formattedKeyword}`)
            ]);

            // Prioritize results: Location > Role > Generic
            let finalJobs = [];
            if (locRes.data.jobs.length > 0) finalJobs = locRes.data.jobs;
            else if (roleRes.data.jobs.length > 0) finalJobs = roleRes.data.jobs;
            else finalJobs = qRes.data.jobs;

            setJobs(finalJobs);
            setTotal(finalJobs.length);
        } catch (error) {
            console.error('Failed to fetch SEO jobs', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-black text-white">
            <Navbar />

            {/* SEO Header */}
            <div className="bg-zinc-900/50 border-b border-zinc-800 pt-32 pb-12 px-6">
                <div className="max-w-5xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-600 mb-6">
                        {formattedKeyword} Jobs in 2024
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        Apply to {total > 0 ? total : 'latest'} verified {formattedKeyword} openings at top companies.
                        Get salary details, interview insights, and direct application links.
                    </p>
                </div>
            </div>

            {/* Jobs Grid */}
            <div className="max-w-5xl mx-auto px-6 py-12">
                {loading ? (
                    <div className="flex flex-col items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mb-4"></div>
                        <p className="text-zinc-500">Curating the best jobs for you...</p>
                    </div>
                ) : jobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {jobs.map((job, idx) => (
                            <JobCard key={job._id} job={job} index={idx} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-2xl">
                        <p className="text-zinc-400 text-lg mb-4">No active openings found for "{formattedKeyword}" right now.</p>
                        <p className="text-zinc-500">Join our Telegram channel to get notified immediately.</p>
                        <a href="https://t.me/jobgridupdates" className="inline-block mt-4 px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors">
                            Join Telegram Alert
                        </a>
                    </div>
                )}
            </div>

            {/* Auto-Generated Content (For SEO Depth) */}
            <div className="max-w-4xl mx-auto px-6 py-12 border-t border-zinc-900">
                <h2 className="text-2xl font-bold text-white mb-6">About {formattedKeyword} Careers</h2>
                <div className="prose prose-invert text-zinc-400">
                    <p>
                        The demand for **{formattedKeyword}** works professionals is growing rapidly in India.
                        Top companies are actively hiring freshers and experienced candidates with competitive packages.
                    </p>
                    <h3 className="text-white mt-4 mb-2">How to get a Job in {formattedKeyword}?</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Update your resume with key skills related to {formattedKeyword}.</li>
                        <li>Build a portfolio of projects.</li>
                        <li>Apply early to "Fresh" jobs on JobGrid.</li>
                        <li>Prepare for technical interviews focusing on core concepts.</li>
                    </ul>
                </div>
            </div>

            <Footer />
        </main>
    );
}
