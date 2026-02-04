import { Metadata } from 'next';
import { getJobs } from '@/services/api';
import JobCard from '@/components/JobCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import EmailSubscription from '@/components/EmailSubscription';
import { Job } from '@/types';
import { Search, SlidersHorizontal, Briefcase } from 'lucide-react';
import Filters from '@/components/Filters';

export const metadata: Metadata = {
    title: 'Browse Jobs | JobPortal - Latest Government & Private Jobs',
    description: 'Explore thousands of job opportunities in government and private sectors. Filter by location, category, and salary. Find your dream career today.',
    openGraph: {
        title: 'Browse Jobs | JobPortal',
        description: 'Explore thousands of job opportunities',
        type: 'website',
    },
};

export const dynamic = 'force-dynamic';

// Define Props
interface JobsPageProps {
    searchParams: Promise<{
        q?: string;
        category?: string;
        location?: string;
        page?: string;
        batch?: string;
        tags?: string;
        jobType?: string;
        roleType?: string;
        minSalary?: string;
        isRemote?: string;
    }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
    // Await searchParams for Next.js 15+
    const params = await searchParams;

    let jobs: Job[] = [];
    let pagination = { page: 1, limit: 10, total: 0, pages: 1 };

    try {
        const res: any = await getJobs({
            q: params.q,
            category: params.category,
            location: params.location,
            batch: params.batch,
            tags: params.tags,
            jobType: params.jobType,
            roleType: params.roleType,
            page: parseInt(params.page || '1'),
            minSalary: params.minSalary ? parseInt(params.minSalary) : undefined,
            isRemote: params.isRemote === 'true'
        });

        // Handle response structure difference (array vs object)
        if (Array.isArray(res)) {
            jobs = res;
        } else if (res && res.jobs) {
            jobs = res.jobs;
            pagination = res.pagination;
        }
    } catch (error) {
        console.error('Failed to fetch jobs', error);
    }

    return (
        <main className="min-h-screen bg-black">
            <Navbar />

            {/* Header */}
            <section className="pt-32 pb-10 px-6 border-b border-zinc-800">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-black text-white mb-4">Browse Engineering Jobs</h1>
                    <p className="text-zinc-400">Discover {pagination.total} curated tech & engineering roles</p>
                </div>
            </section>

            {/* Jobs Grid */}
            <section className="py-10 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-10">

                        {/* Sidebar Filters */}
                        <aside className="lg:w-72">
                            <div className="sticky top-32 space-y-6">
                                <Filters />
                                <AdBanner slotId="jobs-sidebar-1" />
                            </div>
                        </aside>

                        {/* Main */}
                        <div className="flex-1">
                            <div className="space-y-4">
                                {jobs.map((job, idx) => (
                                    <JobCard key={job._id} job={job} index={idx} />
                                ))}

                                {jobs.length === 0 && (
                                    <div className="py-20 text-center border border-zinc-800 rounded-2xl">
                                        <Briefcase className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-white mb-2">No jobs match your filters</h3>
                                        <p className="text-zinc-500">Try adjusting your filters to see more results</p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {pagination.pages > 1 && (
                                <div className="flex justify-center gap-2 mt-10">
                                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                                        <a
                                            key={p}
                                            href={`/jobs?page=${p}${params.q ? `&q=${params.q}` : ''}`}
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-colors ${p === pagination.page
                                                ? 'bg-amber-500 text-black'
                                                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                                                }`}
                                        >
                                            {p}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
