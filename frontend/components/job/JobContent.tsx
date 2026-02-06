"use client";

import { CheckCircle2, ExternalLink, FileText, Target, Lightbulb, Award, ChevronRight } from 'lucide-react';
import { Job } from '@/types';

interface JobContentProps {
    job: Job;
}

export default function JobContent({ job }: JobContentProps) {
    return (
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-[2rem] overflow-hidden">
            <div className="p-8 space-y-8">

                {/* Job Description */}
                <ContentSection
                    icon={FileText}
                    iconColor="from-amber-500 to-yellow-500"
                    title="Job Description"
                >
                    <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-base">
                        {job.description}
                    </div>
                </ContentSection>

                {job.rolesResponsibility && (
                    <ContentSection
                        icon={Target}
                        iconColor="from-blue-500 to-cyan-500"
                        title="Roles & Responsibilities"
                    >
                        <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-base">
                            {job.rolesResponsibility}
                        </div>
                    </ContentSection>
                )}

                {job.requirements && (
                    <ContentSection
                        icon={Award}
                        iconColor="from-purple-500 to-pink-500"
                        title="Requirements"
                    >
                        <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-base">
                            {job.requirements}
                        </div>
                    </ContentSection>
                )}

                {job.niceToHave && (
                    <ContentSection
                        icon={Lightbulb}
                        iconColor="from-emerald-500 to-teal-500"
                        title="Nice to Have"
                    >
                        <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-base">
                            {job.niceToHave}
                        </div>
                    </ContentSection>
                )}

                {/* Eligibility */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-black text-white">Eligibility Criteria</h2>
                    </div>
                    <div className="p-5 rounded-2xl bg-green-500/5 border border-green-500/20">
                        <div className="flex items-start gap-3">
                            <ChevronRight className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                            <p className="text-zinc-300 font-medium">{job.eligibility}</p>
                        </div>
                    </div>
                </div>

                {/* Tech Stack Tags */}
                {job.tags && job.tags.length > 0 && (
                    <div className="pt-6 border-t border-zinc-800">
                        <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Tech Stack & Skills</p>
                        <div className="flex flex-wrap gap-2">
                            {job.tags.map(tag => (
                                <span key={tag} className="px-4 py-2 text-sm font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xl hover:border-amber-500/30 hover:text-amber-400 transition-colors">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Apply CTA */}
            <div className="p-8 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-500/10 border-t border-zinc-800">
                <div className="text-center max-w-lg mx-auto">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-xl shadow-amber-500/25">
                        <ExternalLink className="w-7 h-7 text-black" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">Ready to Apply?</h3>
                    <p className="text-zinc-500 mb-6">Click below to visit the official application page and submit your application</p>

                    <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-3 w-full max-w-md px-8 py-5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-lg rounded-2xl shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                    >
                        Apply Now
                        <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </a>

                    <p className="text-zinc-600 text-xs mt-4">You'll be redirected to the company's official careers page</p>
                </div>
            </div>
        </div>
    );
}

function ContentSection({
    icon: Icon,
    iconColor,
    title,
    children
}: {
    icon: any;
    iconColor: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${iconColor} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-black text-white">{title}</h2>
            </div>
            {children}
        </div>
    );
}
