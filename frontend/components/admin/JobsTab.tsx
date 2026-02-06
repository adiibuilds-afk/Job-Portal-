"use client";

import { Briefcase, AlertTriangle, Eye, TrendingUp, ToggleLeft, ToggleRight, Trash2, Search, Filter, ArrowUpDown, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Job, AdminAnalytics } from '@/types';
import { useState } from 'react';

interface JobsTabProps {
    jobs: Job[];
    analytics: AdminAnalytics;
    jobFilter: 'all' | 'reported';
    setJobFilter: (filter: 'all' | 'reported') => void;
    toggleJobStatus: (id: string, current: boolean) => void;
    deleteJob: (id: string) => void;
    clearAllJobs: () => void;
    clearReportedJobs: () => void;
}

export default function JobsTab({ jobs, analytics, jobFilter, setJobFilter, toggleJobStatus, deleteJob, clearAllJobs, clearReportedJobs }: JobsTabProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const reportedJobs = jobs.filter(j => (j.reportCount || 0) > 0);
    const filteredJobs = jobFilter === 'reported' ? reportedJobs : jobs;
    const displayJobs = filteredJobs.filter(j =>
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.company.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                        <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    Job Control Center
                </h2>
                <p className="text-zinc-500 font-medium">Manage listings, monitor engagement, and handle reports.</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Active Jobs', value: jobs.length, icon: Briefcase, color: 'amber', trend: '+12 today' },
                    { label: 'Reports', value: reportedJobs.length, icon: AlertTriangle, color: 'red', trend: 'Review needed' },
                    { label: 'Total Views', value: analytics.totalViews.toLocaleString(), icon: Eye, color: 'blue', trend: '+5.2%' },
                    { label: 'Avg CTR', value: `${((analytics.totalClicks / (analytics.totalViews || 1)) * 100).toFixed(1)}%`, icon: TrendingUp, color: 'green', trend: 'Healthy' },
                ].map((stat, i) => (
                    <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl bg-zinc-800 border border-zinc-700 text-${stat.color}-500 transition-transform group-hover:scale-110`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 bg-${stat.color}-500/10 text-${stat.color}-500 rounded-full border border-${stat.color}-500/20`}>
                                {stat.trend}
                            </span>
                        </div>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Filter & Actions Bar */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-6">
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search jobs by title or company..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 transition-all font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Filter Tabs */}
                        <div className="flex bg-zinc-950 border border-zinc-800 rounded-2xl p-1">
                            <button
                                onClick={() => setJobFilter('all')}
                                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${jobFilter === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-white'}`}
                            >
                                All ({jobs.length})
                            </button>
                            <button
                                onClick={() => setJobFilter('reported')}
                                className={`px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${jobFilter === 'reported' ? 'bg-red-500/10 text-red-500' : 'text-zinc-600 hover:text-red-400'}`}
                            >
                                <AlertTriangle className="w-3 h-3" /> Reported ({reportedJobs.length})
                            </button>
                        </div>

                        {/* Action Buttons */}
                        {reportedJobs.length > 0 && (
                            <button
                                onClick={clearReportedJobs}
                                className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-black rounded-xl transition-all border border-red-500/20 uppercase tracking-wider flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" /> Clear Reported
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-zinc-900/50 border-b border-zinc-800">
                        <tr>
                            <th className="px-6 py-5 text-xs font-black text-zinc-500 uppercase tracking-widest">Job Details</th>
                            <th className="px-6 py-5 text-xs font-black text-zinc-500 uppercase tracking-widest text-center">Traffic</th>
                            <th className="px-6 py-5 text-xs font-black text-zinc-500 uppercase tracking-widest text-center">Status</th>
                            <th className="px-6 py-5 text-xs font-black text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                        {displayJobs.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-16 text-center text-zinc-600 font-bold">
                                    No jobs found matching your criteria.
                                </td>
                            </tr>
                        )}
                        {displayJobs.map(job => (
                            <tr key={job._id} className="hover:bg-zinc-900/30 transition-colors group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sm font-black text-amber-500 overflow-hidden shrink-0">
                                            {job.companyLogo ? (
                                                <img
                                                    src={job.companyLogo}
                                                    alt={job.company}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        (e.target as HTMLImageElement).parentElement!.innerText = job.company.charAt(0);
                                                    }}
                                                />
                                            ) : (
                                                job.company.charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <Link href={`/job/${job.slug}`} className="text-white font-bold block mb-1 hover:text-blue-400 transition-colors flex items-center gap-2">
                                                {job.title}
                                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Link>
                                            <span className="text-zinc-500 text-sm font-medium">{job.company}</span>
                                            {job.reportCount! > 0 && (
                                                <span className="ml-3 text-red-500 text-[10px] bg-red-500/10 px-2 py-0.5 rounded-full font-black">
                                                    🚨 {job.reportCount} Reports
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center justify-center gap-6">
                                        <div className="text-center">
                                            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Views</p>
                                            <p className="text-lg font-black text-white">{job.views || 0}</p>
                                        </div>
                                        <div className="w-[1px] h-8 bg-zinc-800" />
                                        <div className="text-center">
                                            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Clicks</p>
                                            <p className="text-lg font-black text-white">{job.clicks || 0}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <button
                                        onClick={() => toggleJobStatus(job._id, job.isActive !== false)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mx-auto transition-all ${job.isActive !== false
                                            ? 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20'
                                            : 'bg-zinc-800 text-zinc-500 border border-zinc-700 hover:bg-zinc-700'}`}
                                    >
                                        {job.isActive !== false ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                        {job.isActive !== false ? 'Live' : 'Hidden'}
                                    </button>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <button
                                        onClick={() => deleteJob(job._id)}
                                        className="p-3 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination Placeholder */}
                <div className="p-6 bg-zinc-900/50 border-t border-zinc-800 flex justify-between items-center">
                    <span className="text-xs font-black text-zinc-600 uppercase tracking-widest">
                        Showing {displayJobs.length} of {jobs.length} jobs
                    </span>
                    {jobs.length > 0 && (
                        <button
                            onClick={clearAllJobs}
                            className="px-4 py-2 bg-zinc-900 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 text-xs font-black rounded-xl transition-all border border-zinc-800 hover:border-red-500/30 uppercase tracking-wider flex items-center gap-2"
                        >
                            <Trash2 className="w-3 h-3" /> Purge All Jobs
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
