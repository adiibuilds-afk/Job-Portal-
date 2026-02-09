import { Metadata } from 'next';
import { getJobs } from '@/services/api';
import JobCard from '@/components/JobCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import { Job } from '@/types';
import { Search, Briefcase, TrendingUp, Sparkles, Filter, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import Filters from '@/components/Filters';
import Link from 'next/link';
import JobSorter from '@/components/jobs/JobSorter';

export const metadata: Metadata = {
    title: 'Browse Jobs | JobGrid - B.Tech, IT & Software Engineering Jobs',
    description: 'Explore 10,000+ software engineering, SDE, full-stack, backend, frontend & data science jobs. Filter by batch, role type, and location. Apply now!',
    openGraph: {
        title: 'Browse IT & Software Jobs | JobGrid',
        description: 'Explore 10,000+ tech jobs for B.Tech graduates. Updated hourly.',
        type: 'website',
    },
};

export const dynamic = 'force-dynamic';

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
        sort?: string;
    }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
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
            isRemote: params.isRemote === 'true',
            sort: params.sort
        });

        if (Array.isArray(res)) {
            jobs = res;
        } else if (res && res.jobs) {
            jobs = res.jobs;
            pagination = res.pagination;
        }
    } catch (error) {
        console.error('Failed to fetch jobs', error);
    }

    const hasActiveFilters = params.batch || params.jobType || params.roleType || params.isRemote || params.minSalary;

    return (
        <main className="min-h-screen bg-black">

            {/* Premium Hero Header */}
            <section className="pt-32 pb-12 px-6 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-20 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-6xl mx-auto relative z-10">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
                        <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
                        <span>/</span>
                        <span className="text-white">Jobs</span>
                    </div>

                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-xl shadow-amber-500/20">
                                    <Briefcase className="w-6 h-6 text-black" />
                                </div>
                                <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    Live Jobs
                                </div>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight">
                                Discover Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">Dream Role</span>
                            </h1>
                            <p className="text-zinc-400 text-lg max-w-xl">
                                {pagination.total.toLocaleString()} curated engineering & tech opportunities from top companies, updated in real-time.
                            </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex gap-6">
                            <div className="text-center px-6 py-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-xl">
                                <div className="text-3xl font-black text-white mb-1">{pagination.total}</div>
                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Jobs</div>
                            </div>
                            <div className="text-center px-6 py-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-xl">
                                <div className="text-3xl font-black text-amber-500 mb-1">{jobs.filter(j => new Date().getTime() - new Date(j.createdAt).getTime() < 24 * 60 * 60 * 1000).length}</div>
                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">New Today</div>
                            </div>
                        </div>
                    </div>

                    {/* Active Filters Indicator */}
                    {hasActiveFilters && (
                        <div className="mt-6 flex items-center gap-3">
                            <Filter className="w-4 h-4 text-amber-500" />
                            <span className="text-sm text-zinc-400">Filters active:</span>
                            <div className="flex gap-2">
                                {params.batch && (
                                    <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-lg border border-blue-500/20">
                                        Batch: {params.batch}
                                    </span>
                                )}
                                {params.jobType && (
                                    <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs font-bold rounded-lg border border-purple-500/20">
                                        {params.jobType}
                                    </span>
                                )}
                                {params.roleType && (
                                    <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-lg border border-green-500/20">
                                        {params.roleType}
                                    </span>
                                )}
                                {params.isRemote && (
                                    <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-bold rounded-lg border border-cyan-500/20">
                                        Remote
                                    </span>
                                )}
                            </div>
                            <Link href="/jobs" className="text-xs text-red-400 hover:text-red-300 underline ml-2">Clear all</Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Jobs Grid */}
            <section className="py-10 px-6 border-t border-zinc-800/50">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-10">

                        {/* Sidebar Filters */}
                        <aside className="lg:w-80 shrink-0">
                            <div className="sticky top-28 space-y-6">
                                <Filters />
                                <AdBanner slotId="jobs-sidebar-1" />
                            </div>
                        </aside>

                        {/* Main Content */}
                        <div className="flex-1">
                            {/* Results Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-zinc-500 text-sm">
                                        Showing <span className="text-white font-bold">{((pagination.page - 1) * pagination.limit) + 1}</span> - <span className="text-white font-bold">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="text-white font-bold">{pagination.total}</span>
                                    </span>
                                </div>
                                <JobSorter />
                            </div>

                            {/* Job Cards */}
                            <div className="space-y-4">
                                {jobs.map((job, idx) => (
                                    <JobCard key={job._id} job={job} index={idx} />
                                ))}

                                {jobs.length === 0 && (
                                    <div className="py-24 text-center border border-zinc-800 rounded-3xl bg-zinc-900/30 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
                                        <div className="relative z-10">
                                            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                                                <Briefcase className="w-10 h-10 text-zinc-600" />
                                            </div>
                                            <h3 className="text-2xl font-black text-white mb-2">No Jobs Found</h3>
                                            <p className="text-zinc-500 mb-6 max-w-md mx-auto">We couldn't find any jobs matching your current filters. Try adjusting them to see more results.</p>
                                            <Link href="/jobs" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all">
                                                <Sparkles className="w-4 h-4" /> Clear Filters
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {pagination.pages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-12">
                                    {/* Previous */}
                                    <Link
                                        href={`/jobs?page=${Math.max(1, pagination.page - 1)}${params.q ? `&q=${params.q}` : ''}${params.batch ? `&batch=${params.batch}` : ''}${params.jobType ? `&jobType=${params.jobType}` : ''}`}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all border ${pagination.page === 1
                                            ? 'bg-zinc-900 text-zinc-600 border-zinc-800 pointer-events-none'
                                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-amber-500/30 hover:text-white'
                                            }`}
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </Link>

                                    {/* Page Numbers */}
                                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                                        let pageNum;
                                        if (pagination.pages <= 5) {
                                            pageNum = i + 1;
                                        } else if (pagination.page <= 3) {
                                            pageNum = i + 1;
                                        } else if (pagination.page >= pagination.pages - 2) {
                                            pageNum = pagination.pages - 4 + i;
                                        } else {
                                            pageNum = pagination.page - 2 + i;
                                        }
                                        return pageNum;
                                    }).map((p) => (
                                        <Link
                                            key={p}
                                            href={`/jobs?page=${p}${params.q ? `&q=${params.q}` : ''}${params.batch ? `&batch=${params.batch}` : ''}${params.jobType ? `&jobType=${params.jobType}` : ''}`}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all border ${p === pagination.page
                                                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black border-transparent shadow-lg shadow-amber-500/20'
                                                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                                                }`}
                                        >
                                            {p}
                                        </Link>
                                    ))}

                                    {/* Next */}
                                    <Link
                                        href={`/jobs?page=${Math.min(pagination.pages, pagination.page + 1)}${params.q ? `&q=${params.q}` : ''}${params.batch ? `&batch=${params.batch}` : ''}${params.jobType ? `&jobType=${params.jobType}` : ''}`}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all border ${pagination.page === pagination.pages
                                            ? 'bg-zinc-900 text-zinc-600 border-zinc-800 pointer-events-none'
                                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-amber-500/30 hover:text-white'
                                            }`}
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            )}

                            {/* Page Info */}
                            {pagination.pages > 1 && (
                                <p className="text-center text-xs text-zinc-600 mt-4">
                                    Page {pagination.page} of {pagination.pages}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main >
    );
}
