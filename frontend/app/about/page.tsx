import { Suspense } from 'react';
import Footer from '@/components/Footer';

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-black text-white">
            <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
                <h1 className="text-5xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-500">
                    About JobGrid
                </h1>
                <div className="prose prose-invert prose-amber max-w-none">
                    <p className="text-xl text-zinc-400 leading-relaxed mb-6">
                        JobGrid is India's premier AI-powered job discovery platform, dedicated to connecting talented engineers with their dream opportunities.
                    </p>
                    <h2 className="text-2xl font-bold mt-10 mb-4">Our Mission</h2>
                    <p className="text-zinc-400 mb-6">
                        We aim to simplify the job search process by curating the best software engineering, tech, and IT roles from top startups, MNCs, and product companies. Our goal is to empower B.Tech freshers and IT professionals with the tools they need to launch and grow their careers.
                    </p>
                    <h2 className="text-2xl font-bold mt-10 mb-4">Why Choose Us?</h2>
                    <ul className="list-disc list-inside text-zinc-400 space-y-3">
                        <li>AI-Powered Job Extraction: We scan thousands of sources to bring you verified listings.</li>
                        <li>Niche Focus: Dedicated exclusively to Engineering and Tech roles.</li>
                        <li>Clean UI: No clutter, just the jobs you care about.</li>
                        <li>Real-time Updates: Get notified as soon as a job is posted.</li>
                    </ul>
                </div>
            </div>
            <Footer />
        </main>
    );
}
