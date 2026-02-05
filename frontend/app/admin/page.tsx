"use client";

import { useState, useEffect } from 'react';
import { Briefcase, AlertTriangle, Users, TrendingUp, Eye, MousePointer, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jobgrid.in';

interface Job {
    _id: string;
    title: string;
    company: string;
    slug: string;
    views: number;
    clicks: number;
    isActive: boolean;
    reportCount: number;
    createdAt: string;
}

interface Analytics {
    totalJobs: number;
    totalViews: number;
    totalClicks: number;
}

export default function AdminDashboard() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [analytics, setAnalytics] = useState<Analytics>({ totalJobs: 0, totalViews: 0, totalClicks: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'reported'>('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [jobsRes, analyticsRes] = await Promise.all([
                fetch(`${API_URL}/api/jobs?limit=100`),
                fetch(`${API_URL}/api/analytics`)
            ]);

            const jobsData = await jobsRes.json();
            const analyticsData = await analyticsRes.json();

            setJobs(jobsData.jobs || []);
            setAnalytics(analyticsData);
        } catch (err) {
            console.error('Failed to fetch admin data', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleJobStatus = async (jobId: string, currentStatus: boolean) => {
        try {
            // TODO: Implement backend endpoint for toggling job status
            setJobs(jobs.map(j =>
                j._id === jobId ? { ...j, isActive: !currentStatus } : j
            ));
        } catch (err) {
            console.error('Failed to toggle job status', err);
        }
    };

    const deleteJob = async (jobId: string) => {
        if (!confirm('Are you sure you want to delete this job?')) return;

        try {
            // TODO: Implement backend delete endpoint
            setJobs(jobs.filter(j => j._id !== jobId));
        } catch (err) {
            console.error('Failed to delete job', err);
        }
    };

    const reportedJobs = jobs.filter(j => (j.reportCount || 0) > 0);
    const displayJobs = activeTab === 'reported' ? reportedJobs : jobs;

    if (loading) {
        return (
            <main className="min-h-screen bg-black p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 w-64 bg-zinc-800 rounded"></div>
                        <div className="grid grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-32 bg-zinc-800 rounded-2xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
                        <p className="text-zinc-500">Manage jobs, reports, and analytics</p>
                    </div>
                    <Link href="/" className="px-4 py-2 bg-zinc-800 text-zinc-400 rounded-xl hover:text-white transition-colors">
                        ← Back to Site
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-amber-400" />
                            </div>
                            <span className="text-zinc-400">Total Jobs</span>
                        </div>
                        <p className="text-3xl font-black text-white">{analytics.totalJobs}</p>
                    </div>

                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Eye className="w-5 h-5 text-blue-400" />
                            </div>
                            <span className="text-zinc-400">Total Views</span>
                        </div>
                        <p className="text-3xl font-black text-white">{analytics.totalViews}</p>
                    </div>

                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <MousePointer className="w-5 h-5 text-green-400" />
                            </div>
                            <span className="text-zinc-400">Total Clicks</span>
                        </div>
                        <p className="text-3xl font-black text-white">{analytics.totalClicks}</p>
                    </div>

                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                            </div>
                            <span className="text-zinc-400">Reported Jobs</span>
                        </div>
                        <p className="text-3xl font-black text-white">{reportedJobs.length}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'all'
                            ? 'bg-amber-500 text-black'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                    >
                        All Jobs ({jobs.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('reported')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'reported'
                            ? 'bg-red-500 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                    >
                        🚨 Reported ({reportedJobs.length})
                    </button>
                </div>

                {/* Jobs Table */}
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-zinc-800/50">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-bold text-zinc-500 uppercase">Job</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-zinc-500 uppercase">Views</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-zinc-500 uppercase">Clicks</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-zinc-500 uppercase">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-zinc-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayJobs.map((job) => (
                                <tr key={job._id} className="border-t border-zinc-800 hover:bg-zinc-800/30">
                                    <td className="px-6 py-4">
                                        <div>
                                            <Link href={`/job/${job.slug}`} className="text-white font-medium hover:text-amber-400">
                                                {job.title}
                                            </Link>
                                            <p className="text-sm text-zinc-500">{job.company}</p>
                                            {(job.reportCount || 0) > 0 && (
                                                <span className="inline-flex items-center gap-1 text-xs text-red-400 mt-1">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    {job.reportCount} reports
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-400">{job.views || 0}</td>
                                    <td className="px-6 py-4 text-zinc-400">{job.clicks || 0}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => toggleJobStatus(job._id, job.isActive !== false)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${job.isActive !== false
                                                ? 'bg-green-500/10 text-green-400'
                                                : 'bg-zinc-700 text-zinc-400'
                                                }`}
                                        >
                                            {job.isActive !== false ? (
                                                <><ToggleRight className="w-4 h-4" /> Active</>
                                            ) : (
                                                <><ToggleLeft className="w-4 h-4" /> Hidden</>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => deleteJob(job._id)}
                                            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {displayJobs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                        No jobs found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
