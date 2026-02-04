"use client";

import Link from 'next/link';
import { Job } from '@/types';
import { MapPin, Banknote, Clock, ArrowUpRight, Building2, Bookmark, Flag, Check } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useSavedJobs } from '@/hooks/useSavedJobs';
import { reportJob } from '@/services/api';
import { useState } from 'react';

interface JobCardProps {
    job: Job;
    index?: number;
}

export default function JobCard({ job, index = 0 }: JobCardProps) {
    const { isSaved, toggleSave } = useSavedJobs();
    const saved = isSaved(job._id);
    const [reported, setReported] = useState(false);

    const handleReport = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm('Are you sure you want to report this job as expired or spam?')) {
            try {
                await reportJob(job._id, 'User reported via card');
                setReported(true);
                alert('Thanks for reporting! We will review this job.');
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleSave = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSave(job._id);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="group relative"
        >
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-300 overflow-hidden">
                {/* Gold accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-amber-500/20 flex items-center justify-center text-xl font-bold text-amber-400 group-hover:border-amber-500/40 transition-colors">
                            {job.company.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                                {job.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <Building2 className="w-3.5 h-3.5 text-zinc-600" />
                                <p className="text-sm text-zinc-500">{job.company}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        {job.isFeatured && (
                            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-500 text-black rounded-full">
                                Featured
                            </span>
                        )}
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                className={`p-2 rounded-full transition-colors ${saved ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-500 hover:text-white'}`}
                                title={saved ? "Unsave" : "Save Job"}
                            >
                                <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                            </button>
                            <button
                                onClick={handleReport}
                                disabled={reported}
                                className={`p-2 rounded-full bg-zinc-800 transition-colors ${reported ? 'text-green-500' : 'text-zinc-500 hover:text-red-500'}`}
                                title="Report Job"
                            >
                                {reported ? <Check className="w-4 h-4" /> : <Flag className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Engineering Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {/* Batch Tags */}
                    {job.batch && job.batch.length > 0 && job.batch.map(b => (
                        <span key={b} className="px-2 py-1 text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md">
                            {b} Batch
                        </span>
                    ))}

                    {/* Job Type */}
                    {job.jobType && (
                        <span className="px-2 py-1 text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md">
                            {job.jobType}
                        </span>
                    )}

                    {/* Tech Stack (Limit to 3) */}
                    {job.tags && job.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-md">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Legacy Info Tags */}
                <div className="flex flex-wrap gap-2 mb-5">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-xs text-zinc-400">
                        <MapPin className="w-3.5 h-3.5 text-amber-500" />
                        {job.location}
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-xs text-zinc-400">
                        <Banknote className="w-3.5 h-3.5 text-green-500" />
                        {job.salary}
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-xs text-zinc-400">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        {format(new Date(job.createdAt), 'MMM d')}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <span className="px-3 py-1 text-xs font-medium bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
                        {job.category}
                    </span>

                    <Link
                        href={`/job/${job.slug}`}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-amber-500/25 transition-all group/btn"
                    >
                        View
                        <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
