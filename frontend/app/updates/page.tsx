import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function UpdatesPage() {
    return (
        <main className="min-h-screen bg-black text-white">
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 py-32">
                <h1 className="text-4xl font-bold mb-8">Latest Updates</h1>

                <div className="space-y-8">
                    <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
                        <span className="text-amber-500 text-sm font-bold">February 6, 2026</span>
                        <h2 className="text-2xl font-bold mt-2 mb-4">Activity Heatmap & Scraper Improvements</h2>
                        <ul className="list-disc list-inside text-zinc-400 space-y-2">
                            <li>Added a GitHub-style Activity Heatmap to the dashboard.</li>
                            <li>Improved scraper intelligence for better company logo and job detail extraction.</li>
                            <li>Fixed layout issues on the jobs page.</li>
                        </ul>
                    </div>

                    <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
                        <span className="text-zinc-500 text-sm font-bold">January 2026</span>
                        <h2 className="text-2xl font-bold mt-2 mb-4">Platform Launch</h2>
                        <p className="text-zinc-400">
                            Launched JobGrid with advanced filtering, AI resume scoring, and automated job aggregation from top platforms.
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
