import { Briefcase, AlertTriangle, Eye, TrendingUp, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Job, AdminAnalytics } from '@/types';

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
    const reportedJobs = jobs.filter(j => (j.reportCount || 0) > 0);
    const displayJobs = jobFilter === 'reported' ? reportedJobs : jobs;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'Active Jobs', value: jobs.length, icon: Briefcase, color: 'text-amber-400' },
                    { label: 'Reports', value: reportedJobs.length, icon: AlertTriangle, color: 'text-red-400' },
                    { label: 'Total Views', value: analytics.totalViews.toLocaleString(), icon: Eye, color: 'text-blue-400' },
                    { label: 'Avg CTR', value: `${((analytics.totalClicks / (analytics.totalViews || 1)) * 100).toFixed(1)}%`, icon: TrendingUp, color: 'text-green-400' },
                ].map((stat, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center mb-4">
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <p className="text-zinc-500 text-sm font-medium">{stat.label}</p>
                        <h3 className="text-3xl font-black text-white mt-1">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Filter & Actions Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex gap-4">
                    <button onClick={() => setJobFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-bold ${jobFilter === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-600'}`}>All</button>
                    <button onClick={() => setJobFilter('reported')} className={`px-4 py-2 rounded-lg text-sm font-bold ${jobFilter === 'reported' ? 'bg-red-500/10 text-red-500' : 'text-zinc-600'}`}>Reported</button>
                </div>
                <div className="flex gap-3">
                    {reportedJobs.length > 0 && (
                        <button
                            onClick={clearReportedJobs}
                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-black rounded-lg transition-all border border-red-500/20 uppercase tracking-wider flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" /> Clear Reported
                        </button>
                    )}
                    {jobs.length > 0 && (
                        <button
                            onClick={clearAllJobs}
                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-red-400 text-xs font-black rounded-lg transition-all border border-zinc-700 uppercase tracking-wider flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" /> Delete All Jobs
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-zinc-800">
                        <tr>
                            <th className="px-6 py-4 text-xs font-black text-zinc-400 uppercase">Job Details</th>
                            <th className="px-6 py-4 text-xs font-black text-zinc-400 uppercase">Traffic</th>
                            <th className="px-6 py-4 text-xs font-black text-zinc-400 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-black text-zinc-400 text-right uppercase">Management</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {displayJobs.map(job => (
                            <tr key={job._id} className="hover:bg-zinc-800/30 transition-colors">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-amber-500 overflow-hidden shrink-0">
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
                                            <Link href={`/job/${job.slug}`} className="text-white font-bold block mb-1 hover:text-amber-400">
                                                {job.title}
                                            </Link>
                                            <span className="text-zinc-500 text-sm">{job.company}</span>
                                            {job.reportCount! > 0 && <span className="ml-3 text-red-500 text-[10px] bg-red-500/10 px-2 py-0.5 rounded-full">🚨 {job.reportCount}</span>}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        <div><p className="text-xs text-zinc-600">Views</p><p className="text-sm font-bold text-zinc-300">{job.views}</p></div>
                                        <div><p className="text-xs text-zinc-600">Clicks</p><p className="text-sm font-bold text-zinc-300">{job.clicks}</p></div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <button
                                        onClick={() => toggleJobStatus(job._id, job.isActive !== false)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${job.isActive !== false ? 'bg-green-500/10 text-green-500' : 'bg-zinc-800 text-zinc-500'}`}
                                    >
                                        {job.isActive !== false ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                        {job.isActive !== false ? 'Live' : 'Hidden'}
                                    </button>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <button onClick={() => deleteJob(job._id)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
