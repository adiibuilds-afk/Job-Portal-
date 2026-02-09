"use client";

import Link from 'next/link';
import { Job } from '@/types';
import { MapPin, Banknote, Clock, ArrowUpRight, Building2, Bookmark, Flag, Check, Sparkles, Users, Eye } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';
import { motion } from 'framer-motion';
import { useSavedJobs } from '@/hooks/useSavedJobs';
import { reportJob } from '@/services/api';
import axios from 'axios';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAppliedJobs } from '@/hooks/useAppliedJobs';
import { toast } from 'react-hot-toast';

interface JobCardProps {
    job: Job;
    index?: number;
}

export default function JobCard({ job, index = 0 }: JobCardProps) {
    const { isSaved, toggleSave } = useSavedJobs();
    const saved = isSaved(job._id);
    const [reported, setReported] = useState(false);

    const { data: session } = useSession();
    const { isApplied, markAsApplied, unmarkAsApplied } = useAppliedJobs();
    const applied = isApplied(job._id);

    const handleReport = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            toast.error('Please login to report jobs.', { icon: '🔒' });
            return;
        }

        if (confirm('Are you sure you want to report this job as expired or spam?')) {
            try {
                await reportJob(job._id, 'User reported via card');
                setReported(true);
                toast.success('Thanks for reporting! We will review this job.');
            } catch (err) {
                console.error(err);
                toast.error('Failed to report job');
            }
        }
    };

    const handleSave = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!session) {
            toast.error('Please login to save jobs.', { icon: '🔒' });
            return;
        }
        toggleSave(job._id);
    };

    const handleApplyMark = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!session) {
            toast.error('Please login to track your applications.', { icon: '🔒' });
            return;
        }

        if (applied) {
            // Un-mark if already applied
            unmarkAsApplied(job._id);
            toast.success('Removed from applied jobs');
        } else {
            // Mark as applied
            markAsApplied(job._id);
            toast.success('Marked as applied!');

            // Track Event for Heatmap
            try {
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/user/track`, {
                    email: session.user?.email,
                    action: 'apply_click',
                    jobId: job._id
                });
            } catch (error) {
                console.error('Failed to track apply click', error);
            }
        }
    };

    // Check if job is fresh (< 4 hours old)
    const isFresh = new Date().getTime() - new Date(job.createdAt).getTime() < 4 * 60 * 60 * 1000;
    // Check if job is new (< 24 hours old)
    const isNew = new Date().getTime() - new Date(job.createdAt).getTime() < 24 * 60 * 60 * 1000;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
            className="group relative"
        >
            {/* Hover Glow */}
            <div className="absolute -inset-px bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 rounded-[1.75rem] blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />

            <div className="relative bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/80 rounded-[1.5rem] overflow-hidden hover:border-amber-500/30 transition-all duration-300">
                {/* Top Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="p-5 md:p-6">
                    {/* Header Row */}
                    <div className="flex items-start gap-4 mb-4">
                        {/* Company Logo */}
                        <div className="relative shrink-0">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 flex items-center justify-center overflow-hidden group-hover:border-amber-500/30 transition-colors shadow-lg">
                                {job.companyLogo ? (
                                    <img
                                        src={job.companyLogo}
                                        alt={job.company}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-xl font-black text-amber-400">${job.company.charAt(0)}</span>`;
                                        }}
                                    />
                                ) : (
                                    <span className="text-xl font-black text-amber-400">{job.company.charAt(0)}</span>
                                )}
                            </div>
                            {/* Fresh Badge */}
                            {isFresh && (
                                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500 border-2 border-zinc-900" />
                                </span>
                            )}
                        </div>

                        {/* Title & Company */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors break-words leading-tight">
                                    {job.title}
                                </h3>
                                {job.isFeatured && (
                                    <span className="shrink-0 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-500 text-black rounded-md flex items-center gap-1">
                                        <Sparkles className="w-2.5 h-2.5" /> Featured
                                    </span>
                                )}
                                {isNew && !isFresh && (
                                    <span className="shrink-0 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/20 rounded-md">
                                        New
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                                    <span className="text-sm text-zinc-400 font-medium">{job.company}</span>
                                </div>
                                {!!job.views && job.views > 10 && (
                                    <div className="flex items-center gap-1 text-zinc-600">
                                        <Eye className="w-3 h-3" />
                                        <span className="text-[10px] font-bold">{job.views}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                            <button
                                onClick={handleApplyMark}
                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border ${applied
                                    ? 'bg-green-500/20 text-green-400 border-green-500/30 shadow-lg shadow-green-500/10'
                                    : 'bg-zinc-800/80 text-zinc-500 border-zinc-700/50 hover:text-green-400 hover:border-green-500/30 hover:bg-green-500/10'
                                    }`}
                                title={applied ? "Applied ✓" : "Mark as Applied"}
                            >
                                <Check className={`w-4 h-4 ${applied ? 'stroke-[3]' : ''}`} />
                            </button>
                            <button
                                onClick={handleSave}
                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border ${saved
                                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-lg shadow-amber-500/10'
                                    : 'bg-zinc-800/80 text-zinc-500 border-zinc-700/50 hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/10'
                                    }`}
                                title={saved ? "Saved ★" : "Save Job"}
                            >
                                <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                            </button>
                            <button
                                onClick={handleReport}
                                disabled={reported}
                                className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${reported
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 cursor-default'
                                    : 'bg-zinc-800/80 text-zinc-600 border-zinc-700/50 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10'
                                    }`}
                                title={reported ? "Reported" : "Report Job"}
                            >
                                {reported ? <Check className="w-4 h-4" /> : <Flag className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Tags Row */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {/* Batch Tags */}
                        {job.batch && job.batch.length > 0 && job.batch.slice(0, 2).map(b => (
                            <span key={b} className="px-2.5 py-1 text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg">
                                🎓 {b} Batch
                            </span>
                        ))}

                        {/* Job Type */}
                        {job.jobType && (
                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${job.jobType === 'Internship'
                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                }`}>
                                {job.jobType === 'Internship' ? '🎯' : '💼'} {job.jobType}
                            </span>
                        )}

                        {/* Tech Stack (Limit to 3) */}
                        {job.tags && job.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2.5 py-1 text-[10px] font-medium bg-zinc-800/80 text-zinc-400 border border-zinc-700/50 rounded-lg">
                                {tag}
                            </span>
                        ))}
                        {job.tags && job.tags.length > 3 && (
                            <span className="px-2 py-1 text-[10px] font-bold text-zinc-500">
                                +{job.tags.length - 3}
                            </span>
                        )}
                    </div>

                    {/* Info Bar */}
                    <div className="flex items-center gap-3 mb-5 flex-wrap">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/50 border border-zinc-700/30 text-xs">
                            <MapPin className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-zinc-300 font-medium">{job.location || 'Remote'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/50 border border-zinc-700/30 text-xs">
                            <Banknote className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-zinc-300 font-medium">{job.salary || 'Competitive'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/50 border border-zinc-700/30 text-xs">
                            <Clock className="w-3.5 h-3.5 text-zinc-500" />
                            <span className="text-zinc-400 font-medium" suppressHydrationWarning>
                                {formatDistanceToNowStrict(new Date(job.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1.5 text-xs font-bold bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                                {job.category}
                            </span>
                            {job.isRemote && (
                                <span className="px-2.5 py-1.5 text-[10px] font-bold bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
                                    🌐 Remote
                                </span>
                            )}
                        </div>

                        <Link
                            href={`/job/${job.slug}`}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black rounded-xl font-bold text-sm hover:shadow-xl hover:shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all group/btn"
                        >
                            View Details
                            <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
