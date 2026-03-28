"use client";

import { CheckCircle2, ExternalLink, FileText, Target, Lightbulb, Award, ChevronRight, Building2, BookOpen, Sparkles } from 'lucide-react';
import { Job } from '@/types';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

interface JobContentProps {
    job: Job;
}

export default function JobContent({ job }: JobContentProps) {
    const { data: session } = useSession();

    const handleApply = async () => {
        if (!job.applyUrl) {
            toast.error('Application URL not found');
            return;
        }

        const newWindow = window.open(job.applyUrl, '_blank');

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${job._id}/click`);
        } catch (error) {
            console.error('Failed to track click:', error);
        }

        if (session?.user?.email) {
            try {
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/user/applied`, {
                    email: session.user.email,
                    jobId: job._id
                });
                toast.success('Application tracked successfully!');
            } catch (error) {
                console.error('Failed to track application:', error);
            }
        }
    };

    return (
        <div className="space-y-8">
            {/* Main Content Card */}
            <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black">
                <div className="p-8 md:p-12 space-y-12">

                    {/* Job Description */}
                    <ContentSection
                        icon={FileText}
                        iconColor="from-amber-500 to-yellow-500"
                        title="Job Description"
                    >
                        <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-lg md:text-xl font-medium">
                            {job.description}
                        </div>
                    </ContentSection>

                    {job.rolesResponsibility && (
                        <ContentSection
                            icon={Target}
                            iconColor="from-blue-500 to-cyan-500"
                            title="Roles & Responsibilities"
                        >
                            <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-base md:text-lg">
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
                            <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-base md:text-lg">
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
                            <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-base md:text-lg">
                                {job.niceToHave}
                            </div>
                        </ContentSection>
                    )}

                    {/* Eligibility */}
                    <div className="pt-8 border-t border-zinc-800/50">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                                <CheckCircle2 className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-black text-white">Eligibility Criteria</h2>
                        </div>
                        <div className="p-6 rounded-3xl bg-green-500/5 border border-green-500/20 flex items-start gap-4">
                            <ChevronRight className="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0" />
                            <p className="text-zinc-200 text-lg font-bold">{job.eligibility}</p>
                        </div>
                    </div>

                    {/* Tech Stack Tags */}
                    {job.tags && job.tags.length > 0 && (
                        <div className="pt-8 border-t border-zinc-800/50 font-sans">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-6">Tech Stack & Ecosystem</p>
                            <div className="flex flex-wrap gap-3">
                                {job.tags.map(tag => (
                                    <span key={tag} className="px-5 py-2.5 text-sm font-bold bg-zinc-800/50 text-zinc-300 border border-zinc-700/50 rounded-2xl hover:border-amber-500/40 hover:text-amber-400 hover:bg-amber-500/5 transition-all cursor-default">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Apply CTA Section */}
                <div className="p-10 md:p-14 bg-gradient-to-b from-transparent to-amber-500/5 border-t border-zinc-800/50">
                    <div className="text-center max-w-2xl mx-auto">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-[2rem] bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/20">
                            <ExternalLink className="w-10 h-10 text-black" />
                        </div>
                        <h3 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Ready to Level Up?</h3>
                        <p className="text-zinc-500 text-lg mb-10">Don't miss out on this opportunity. Click below to start your application on the official company careers portal.</p>

                        <button
                            onClick={handleApply}
                            className="inline-flex items-center justify-center gap-4 w-full max-w-md px-10 py-6 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xl rounded-[2rem] shadow-2xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                        >
                            Apply for Role
                            <ExternalLink className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Insights & Prep Sections - Glassmorphism Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {job.companyInsights && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="glass-card rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all duration-700" />
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white">Company Insights</h2>
                                <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">AI Analysis</p>
                            </div>
                        </div>
                        <div className="text-zinc-300 leading-relaxed text-lg italic border-l-2 border-indigo-500/30 pl-6">
                            {job.companyInsights}
                        </div>
                    </motion.div>
                )}

                {job.interviewTips && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="glass-card rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl group-hover:bg-rose-500/10 transition-all duration-700" />
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white">Interview Guide</h2>
                                <p className="text-xs text-rose-400 font-bold uppercase tracking-widest">Premium Resource</p>
                            </div>
                        </div>
                        <div className="text-zinc-300 leading-relaxed text-lg italic border-l-2 border-rose-500/30 pl-6">
                            {job.interviewTips}
                        </div>
                    </motion.div>
                )}
            </div>
            
            {/* Disclaimer */}
            <p className="text-center text-zinc-600 text-xs py-4 px-8 border border-zinc-900 rounded-2xl bg-black/40">
                JobGrid uses AI to enhance job descriptions and provide career insights. Always verify details on the official company careers page before applying.
            </p>
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
        <section className="animate-slow-fade">
            <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${iconColor} flex items-center justify-center shadow-xl shadow-black/40`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
            </div>
            <div className="pl-0 md:pl-16">
                {children}
            </div>
        </section>
    );
}
