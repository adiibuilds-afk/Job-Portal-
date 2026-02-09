import { Metadata } from 'next';
import { getJobs } from '@/services/api';
import JobCard from '@/components/JobCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import { Job } from '@/types';
import { Briefcase } from 'lucide-react';

interface PageProps {
    params: { type: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const categoryName = params.type === 'govt' ? 'Government' : params.type === 'private' ? 'Private' : params.type;

    return {
        title: `${categoryName} Jobs | JobPortal - Best ${categoryName} Job Opportunities`,
        description: `Browse latest ${categoryName.toLowerCase()} job openings. Find your dream ${categoryName.toLowerCase()} sector career with competitive salaries.`,
        openGraph: {
            title: `${categoryName} Jobs | JobPortal`,
            description: `Browse latest ${categoryName.toLowerCase()} job openings`,
            type: 'website',
        },
    };
}

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: PageProps) {
    let jobs: Job[] = [];
    try {
        jobs = await getJobs();
    } catch (error) {
        console.error('Failed to fetch jobs', error);
    }

    // Filter by category
    const filteredJobs = jobs.filter(
        job => job.category.toLowerCase().includes(params.type.toLowerCase())
    );

    const categoryName = params.type === 'govt' ? 'Government' : params.type === 'private' ? 'Private' : params.type;

    return (
        <main className="min-h-screen bg-black">

            {/* Header */}
            <section className="pt-32 pb-10 px-6 border-b border-zinc-800">
                <div className="max-w-6xl mx-auto">
                    <div className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-medium mb-4">
                        {categoryName} Sector
                    </div>
                    <h1 className="text-4xl font-black text-white mb-4">{categoryName} Jobs</h1>
                    <p className="text-zinc-400">
                        {filteredJobs.length} {categoryName.toLowerCase()} job opportunities available
                    </p>
                </div>
            </section>

            {/* Jobs */}
            <section className="py-10 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-10">

                        {/* Main */}
                        <div className="flex-1">
                            <div className="space-y-4">
                                {filteredJobs.map((job, idx) => (
                                    <JobCard key={job._id} job={job} index={idx} />
                                ))}

                                {filteredJobs.length === 0 && (
                                    <div className="py-20 text-center border border-zinc-800 rounded-2xl">
                                        <Briefcase className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-white mb-2">No {categoryName} jobs yet</h3>
                                        <p className="text-zinc-500">Check back soon for new opportunities</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <aside className="lg:w-80 space-y-6">
                            <AdBanner slotId="category-sidebar-1" />

                            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
                                <h3 className="font-bold text-white mb-4">Other Categories</h3>
                                <div className="space-y-2">
                                    {['govt', 'private', 'it', 'banking'].map((cat) => (
                                        <a
                                            key={cat}
                                            href={`/category/${cat}`}
                                            className={`block px-4 py-2 rounded-lg text-sm transition-colors ${cat === params.type
                                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                                }`}
                                        >
                                            {cat === 'govt' ? 'Government' : cat === 'private' ? 'Private' : cat === 'it' ? 'IT & Software' : 'Banking'}
                                        </a>
                                    ))}
                                </div>
                            </div>

                            <AdBanner slotId="category-sidebar-2" />
                        </aside>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
