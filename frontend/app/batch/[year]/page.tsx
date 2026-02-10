import { Metadata } from 'next';
import JobsPage from '@/app/jobs/page';

export async function generateMetadata({ params }: { params: Promise<{ year: string }> }): Promise<Metadata> {
    const { year } = await params;
    const title = `Jobs for ${year} Batch Freshers | Software & IT Roles | JobGrid`;
    const description = `Find the latest software engineering, developer, and tech jobs specifically for the ${year} batch. Remote, off-campus, and on-campus opportunities across India. Updated daily!`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
        },
    };
}

export default async function BatchLandingPage({ params, searchParams }: { params: Promise<{ year: string }>, searchParams: Promise<any> }) {
    const { year } = await params;
    const sParams = await searchParams;

    // Inject the year into searchParams for the JobsPage component to pick up
    const enrichedSearchParams = Promise.resolve({
        ...sParams,
        batch: year
    });

    return (
        <div className="pt-10">
            {/* SEO Overlay: Custom Header for the Batch Page */}
            <div className="max-w-6xl mx-auto px-6 mb-[-60px] relative z-20">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 backdrop-blur-xl">
                    <h1 className="text-2xl font-black text-white flex items-center gap-3">
                        <span className="text-amber-500">🎓</span>
                        Exclusive Jobs for <span className="text-amber-500">{year} Batch</span> Freshers
                    </h1>
                    <p className="text-zinc-400 text-sm mt-1">
                        Curated software and IT opportunities specifically verified for your batch requirements.
                    </p>
                </div>
            </div>

            <JobsPage searchParams={enrichedSearchParams} />
        </div>
    );
}
