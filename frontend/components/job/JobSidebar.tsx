"use client";

import JobActions from '@/components/JobActions';
import AdBanner from '@/components/AdBanner';
import ColdEmailGenerator from './ColdEmailGenerator';
import { Job } from '@/types';
import { AlertTriangle, Share2, Briefcase, Code2, Globe, Calendar, MousePointerClick, Eye, TrendingUp } from 'lucide-react';

interface JobSidebarProps {
    job: Job;
    slug: string;
}

export default function JobSidebar({ job, slug }: JobSidebarProps) {
    const showDetails = (job.batch && job.batch.length > 0) || job.jobType || job.isRemote || (job.tags && job.tags.length > 0);

    return (
        <div className="sticky top-28 space-y-6">
            {/* Quick Actions */}
            <JobActions jobId={job._id} jobTitle={job.title} jobSlug={slug} />

           
            {/* Job Details Tags */}
            {showDetails && (
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                    <h4 className="font-black text-white mb-4 text-sm uppercase tracking-widest flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-amber-500" /> Quick Info
                    </h4>
                    <div className="space-y-3">
                        {job.jobType && (
                            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                                <span className="text-zinc-500 text-sm font-medium">Type</span>
                                <span className={`px-3 py-1 text-xs font-bold rounded-lg ${job.jobType === 'Internship'
                                        ? 'bg-purple-500/10 text-purple-400'
                                        : 'bg-emerald-500/10 text-emerald-400'
                                    }`}>
                                    {job.jobType}
                                </span>
                            </div>
                        )}
                        {job.roleType && (
                            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                                <span className="text-zinc-500 text-sm font-medium">Role</span>
                                <span className="text-amber-400 text-sm font-bold">{job.roleType}</span>
                            </div>
                        )}
                        {job.isRemote !== undefined && (
                            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                                <span className="text-zinc-500 text-sm font-medium">Work Mode</span>
                                <span className={`px-3 py-1 text-xs font-bold rounded-lg ${job.isRemote
                                        ? 'bg-cyan-500/10 text-cyan-400'
                                        : 'bg-zinc-700 text-zinc-300'
                                    }`}>
                                    {job.isRemote ? '🌐 Remote' : '🏢 On-site'}
                                </span>
                            </div>
                        )}
                        {job.batch && job.batch.length > 0 && (
                            <div className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                                <span className="text-zinc-500 text-sm font-medium block mb-2">Eligible Batches</span>
                                <div className="flex flex-wrap gap-2">
                                    {job.batch.map((b: string) => (
                                        <span key={b} className="px-2.5 py-1 text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg">
                                            {b}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    {job.tags && job.tags.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-zinc-800">
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-3 flex items-center gap-2">
                                <Code2 className="w-3 h-3" /> Tech Stack
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {job.tags.slice(0, 8).map((tag: string) => (
                                    <span key={tag} className="px-2.5 py-1 text-xs font-medium bg-zinc-800 text-zinc-400 rounded-lg border border-zinc-700">
                                        {tag}
                                    </span>
                                ))}
                                {job.tags.length > 8 && (
                                    <span className="px-2 py-1 text-xs font-bold text-zinc-500">
                                        +{job.tags.length - 8}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Cold Email Generator */}
            <ColdEmailGenerator jobTitle={job.title} company={job.company} tags={job.tags} />

            {/* Share */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                <h4 className="font-black text-white mb-4 text-sm uppercase tracking-widest flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-amber-500" /> Share This Job
                </h4>
                <div className="grid grid-cols-2 gap-3">
                    <a
                        href={`https://wa.me/?text=${encodeURIComponent(`Check out this job: ${job.title} at ${job.company}\n\nhttps://jobgrid.in/job/${slug}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-3.5 rounded-xl bg-green-500/10 text-green-400 font-bold text-sm hover:bg-green-500/20 transition-colors border border-green-500/20 text-center"
                    >
                        WhatsApp
                    </a>
                    <a
                        href={`https://t.me/share/url?url=${encodeURIComponent(`https://jobgrid.in/job/${slug}`)}&text=${encodeURIComponent(`${job.title} at ${job.company}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-3.5 rounded-xl bg-blue-500/10 text-blue-400 font-bold text-sm hover:bg-blue-500/20 transition-colors border border-blue-500/20 text-center"
                    >
                        Telegram
                    </a>
                    <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${job.title} at ${job.company}`)}&url=${encodeURIComponent(`https://jobgrid.in/job/${slug}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-3.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-sm hover:bg-zinc-700 transition-colors border border-zinc-700 text-center"
                    >
                        Twitter / X
                    </a>
                    <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://jobgrid.in/job/${slug}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-3.5 rounded-xl bg-blue-600/10 text-blue-500 font-bold text-sm hover:bg-blue-600/20 transition-colors border border-blue-600/20 text-center"
                    >
                        LinkedIn
                    </a>
                </div>
            </div>

            {/* Warning */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 flex items-start gap-4">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm text-red-400 font-bold mb-1">Stay Safe</p>
                    <p className="text-xs text-red-400/70">Never pay for job applications. Report suspicious listings immediately.</p>
                </div>
            </div>

            <AdBanner slotId="sidebar-1" />
        </div>
    );
}
