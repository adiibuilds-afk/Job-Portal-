import { getJobBySlug, getJobs } from '@/services/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import JobCard from '@/components/JobCard';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Job } from '@/types';
import JobHeader from '@/components/job/JobHeader';
import JobContent from '@/components/job/JobContent';
import JobSidebar from '@/components/job/JobSidebar';
import JobSchema from '@/components/job/JobSchema';

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
                            <JobHeader job={job} />
                            <JobContent job={job} />

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
                        <div className="lg:col-span-4">
                            <JobSidebar job={job} slug={slug} />
                        </div>

                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
