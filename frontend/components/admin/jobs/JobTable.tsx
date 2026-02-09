import { ExternalLink, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Job } from '@/types';

interface JobTableProps {
    jobs: Job[];
    toggleJobStatus: (id: string, current: boolean) => void;
    deleteJob: (id: string) => void;
    clearAllJobs: () => void;
    totalCount: number;
}

export default function JobTable({ jobs, toggleJobStatus, deleteJob, clearAllJobs, totalCount }: JobTableProps) {
    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-zinc-900/50 border-b border-zinc-800">
                    <tr>
                        <th className="px-6 py-5 text-xs font-black text-zinc-500 uppercase tracking-widest">Job Details</th>
                        <th className="px-6 py-5 text-xs font-black text-zinc-500 uppercase tracking-widest text-center">Apply Link</th>
                        <th className="px-6 py-5 text-xs font-black text-zinc-500 uppercase tracking-widest text-center">Traffic</th>
                        <th className="px-6 py-5 text-xs font-black text-zinc-500 uppercase tracking-widest text-center">Status</th>
                        <th className="px-6 py-5 text-xs font-black text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                    {jobs.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-16 text-center text-zinc-600 font-bold">
                                No jobs found matching your criteria.
                            </td>
                        </tr>
                    )}
                    {jobs.map(job => (
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
                            <td className="px-6 py-5 text-center">
                                <a
                                    href={job.applyUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg text-xs font-bold transition-all border border-blue-500/20 max-w-[200px]"
                                >
                                    <span className="truncate">{job.applyUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}...</span>
                                    <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
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

            <div className="p-6 bg-zinc-900/50 border-t border-zinc-800 flex justify-between items-center">
                <span className="text-xs font-black text-zinc-600 uppercase tracking-widest">
                    Showing {jobs.length} of {totalCount} jobs
                </span>
                {totalCount > 0 && (
                    <button
                        onClick={clearAllJobs}
                        className="px-4 py-2 bg-zinc-900 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 text-xs font-black rounded-xl transition-all border border-zinc-800 hover:border-red-500/30 uppercase tracking-wider flex items-center gap-2"
                    >
                        <Trash2 className="w-3 h-3" /> Purge All Jobs
                    </button>
                )}
            </div>
        </div>
    );
}
