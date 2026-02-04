import { getJobBySlug, getJobs } from '@/services/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import JobCard from '@/components/JobCard';
import JobActions from '@/components/JobActions';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, Share2, MapPin, Banknote, Calendar, Clock, CheckCircle2, ExternalLink, Building2, Eye } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Job } from '@/types';

interface PageProps {
    params: { slug: string };
}

// Schema.org JobPosting structured data
function JobSchema({ job }: { job: Job }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: job.title,
        description: job.description,
        datePosted: job.createdAt,
        validThrough: job.lastDate || undefined,
        employmentType: 'FULL_TIME',
        hiringOrganization: {
            '@type': 'Organization',
            name: job.company,
        },
        jobLocation: {
            '@type': 'Place',
            address: {
                '@type': 'PostalAddress',
                addressLocality: job.location,
                addressCountry: 'IN',
            },
        },
        baseSalary: {
            '@type': 'MonetaryAmount',
            currency: 'INR',
            value: {
                '@type': 'QuantitativeValue',
                value: job.salary,
            },
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    try {
        const { slug } = await params;
        const job = await getJobBySlug(slug);
        return {
            title: `${job.title} at ${job.company}`,
            description: `${job.title} job opening at ${job.company}. Location: ${job.location}. Salary: ${job.salary}. Apply now!`,
            openGraph: {
                title: `${job.title} at ${job.company}`,
                description: `${job.title} job opening at ${job.company}. Apply now!`,
                type: 'article',
            },
        };
    } catch {
        return {
            title: 'Job Not Found',
        };
    }
}

export default async function JobDetail({ params }: { params: Promise<{ slug: string }> }) {
    let job: Job;
    let relatedJobs: Job[] = [];

    const { slug } = await params;

    try {
        job = await getJobBySlug(slug);
        const allJobs = await getJobs();
        relatedJobs = allJobs
            .filter(j => j.category === job.category && j._id !== job._id)
            .slice(0, 3);
    } catch (err) {
        return notFound();
    }

    return (
        <main className="min-h-screen bg-black relative overflow-hidden">
            <JobSchema job={job} />

            {/* Background */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px]"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-yellow-500/5 rounded-full blur-[100px]"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>

            <Navbar />

            <div className="relative pt-32 pb-20 px-4">
                <div className="max-w-5xl mx-auto">

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-zinc-500 hover:text-amber-400 font-medium mb-8 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to jobs
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Main */}
                        <div className="lg:col-span-8">
                            <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden">

                                {/* Gold accent */}
                                <div className="h-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500"></div>

                                {/* Header */}
                                <div className="p-8 border-b border-zinc-800">
                                    <div className="flex items-start gap-5 mb-6">
                                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-amber-500/20 flex items-center justify-center text-2xl font-black text-amber-400">
                                            {job.company.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
                                                    {job.category}
                                                </span>
                                                <span className="flex items-center gap-1 text-zinc-500 text-sm">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {format(new Date(job.createdAt), 'MMM dd, yyyy')}
                                                </span>
                                            </div>
                                            <h1 className="text-2xl md:text-3xl font-black text-white mb-1">
                                                {job.title}
                                            </h1>
                                            <div className="flex items-center gap-2 text-zinc-400">
                                                <Building2 className="w-4 h-4" />
                                                <span className="font-medium">{job.company}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            { icon: MapPin, label: 'Location', value: job.location || 'Not specified', color: 'text-amber-400' },
                                            { icon: Banknote, label: 'Salary', value: job.salary || 'Not specified', color: 'text-green-400' },
                                            { icon: Calendar, label: 'Deadline', value: job.lastDate || 'ASAP', color: 'text-orange-400' },
                                            { icon: Eye, label: 'Views', value: job.views?.toString() || '0', color: 'text-zinc-400' },
                                        ].map((item, i) => (
                                            <div key={i} className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <item.icon className={`w-4 h-4 ${item.color}`} />
                                                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">{item.label}</span>
                                                </div>
                                                <p className="text-white font-semibold truncate">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8">
                                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                                        <span className="w-1 h-6 bg-gradient-to-b from-amber-500 to-yellow-500 rounded-full"></span>
                                        Job Description
                                    </h2>
                                    <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-base mb-8">
                                        {job.description}
                                    </div>

                                    <div className="h-px bg-zinc-800 my-8"></div>

                                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                                        <span className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></span>
                                        Eligibility
                                    </h2>
                                    <div className="p-5 rounded-xl bg-green-500/5 border border-green-500/20">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                            <p className="text-zinc-300">{job.eligibility}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Apply CTA */}
                                <div className="p-8 bg-gradient-to-r from-amber-500/5 via-yellow-500/5 to-amber-500/5 border-t border-zinc-800">
                                    <div className="text-center max-w-md mx-auto">
                                        <h3 className="text-2xl font-black text-white mb-2">Ready to Apply?</h3>
                                        <p className="text-zinc-500 mb-6 text-sm">Click below to visit the official application page</p>

                                        <a
                                            href={job.applyUrl}
                                            target="_blank"
                                            className="inline-flex items-center justify-center gap-3 w-full px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-lg rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all group"
                                        >
                                            Apply Now
                                            <ExternalLink className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Related Jobs */}
                            {relatedJobs.length > 0 && (
                                <div className="mt-10">
                                    <h2 className="text-2xl font-bold text-white mb-6">Related Jobs</h2>
                                    <div className="space-y-4">
                                        {relatedJobs.map((rJob, idx) => (
                                            <JobCard key={rJob._id} job={rJob} index={idx} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="sticky top-32 space-y-6">
                                {/* Quick Actions */}
                                <JobActions jobId={job._id} jobTitle={job.title} jobSlug={slug} />

                                {/* Job Tags */}
                                {((job.batch && job.batch.length > 0) || job.jobType || job.isRemote || (job.tags && job.tags.length > 0)) && (
                                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                                        <h4 className="font-bold text-white mb-4">Job Details</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {job.batch?.map((b: string) => (
                                                <span key={b} className="px-3 py-1.5 text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg">
                                                    {b} Batch
                                                </span>
                                            ))}
                                            {job.jobType && (
                                                <span className="px-3 py-1.5 text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg">
                                                    {job.jobType}
                                                </span>
                                            )}
                                            {job.isRemote && (
                                                <span className="px-3 py-1.5 text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg">
                                                    🌍 Remote
                                                </span>
                                            )}
                                            {job.roleType && (
                                                <span className="px-3 py-1.5 text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">
                                                    {job.roleType}
                                                </span>
                                            )}
                                        </div>
                                        {job.tags && job.tags.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-zinc-800">
                                                <p className="text-xs text-zinc-500 mb-2">Tech Stack</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {job.tags.map((tag: string) => (
                                                        <span key={tag} className="px-2 py-1 text-xs bg-zinc-800 text-zinc-400 rounded">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Share */}
                                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                                    <h4 className="font-bold text-white mb-4">Share Job</h4>
                                    <div className="flex gap-3">
                                        <a
                                            href={`https://wa.me/?text=${encodeURIComponent(`Check out this job: ${job.title} at ${job.company}`)}`}
                                            target="_blank"
                                            className="flex-1 py-3 rounded-xl bg-green-500/10 text-green-400 font-semibold text-sm hover:bg-green-500/20 transition-colors border border-green-500/20 text-center"
                                        >
                                            WhatsApp
                                        </a>
                                        <a
                                            href={`https://t.me/share/url?url=&text=${encodeURIComponent(`${job.title} at ${job.company}`)}`}
                                            target="_blank"
                                            className="flex-1 py-3 rounded-xl bg-blue-500/10 text-blue-400 font-semibold text-sm hover:bg-blue-500/20 transition-colors border border-blue-500/20 text-center"
                                        >
                                            Telegram
                                        </a>
                                    </div>
                                </div>

                                {/* Warning */}
                                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
                                    <p className="text-sm text-amber-400/80">⚠️ Never pay for job applications. Report suspicious listings.</p>
                                </div>

                                <AdBanner slotId="sidebar-1" />
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
