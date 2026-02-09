import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Sparkles, Zap, Shield, Globe, Bot, Layout, Megaphone } from 'lucide-react';

export default function UpdatesPage() {
    const updates = [
        {
            date: "February 9, 2026",
            title: "Enhanced Job Discovery",
            icon: Sparkles,
            features: [
                "New Sorting Options: View 'Most Popular' and 'Most Applied' jobs.",
                "Better Mobile Experience: Reduced popups and smoother navigation.",
                "Faster Job Alerts: New jobs appear on the platform instantly.",
                "Improved Search: Discover remote and batch-specific roles easier."
            ]
        },
        {
            date: "February 8, 2026",
            title: "More Job Sources & Better Data",
            icon: Globe,
            features: [
                "Added 5+ New Job Sources.",
                "Direct Apply Links: Apply to jobs faster on Telegram & WhatsApp.",
                "Better Company Logos: Standardized logos for a cleaner look.",
                "Smarter Job Matching: Reduced duplicate listings."
            ]
        },
        {
            date: "February 7, 2026",
            title: "Performance & Stability",
            icon: Shield,
            features: [
                "Faster Page Loads: Optimized platform speed specifically for mobile users.",
                "Real-time Data Sync: Job listings are updated every few seconds.",
                "Seamless Navigation: Fixed layout issues on job listings."
            ]
        },
        {
            date: "February 6, 2026",
            title: "Visual & Interface Updates",
            icon: Zap,
            features: [
                "Activity Heatmap: Track daily job posting trends visually.",
                "Responsive Design: Improved layout for tablets and small screens.",
                "Cleaner Job Cards: Better readability for job descriptions."
            ]
        },
        {
            date: "January 2026",
            title: "Platform Launch 🚀",
            icon: Megaphone,
            features: [
                "Official Launch of JobGrid - India's #1 Tech Job Portal.",
                "AI Resume Scoring & Match Percentage.",
                "Automated job aggregation from 50+ sources.",
                "Advanced filtering by Batch, Role, and Salary."
            ]
        }
    ];

    return (
        <main className="min-h-screen bg-black text-white font-sans selection:bg-amber-500/30">
            <Navbar />

            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="mb-16 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Changelog</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
                            Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">Updates</span>
                        </h1>
                        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                            We're constantly shipping new features to help you land your dream job faster. Here's what's new on JobGrid.
                        </p>
                    </div>

                    <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
                        {updates.map((update, index) => (
                            <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                {/* Icon Marker */}
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900 group-hover:bg-amber-500/10 group-hover:border-amber-500/50 transition-all shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_8px_rgba(24,24,27,1)] z-10">
                                    <update.icon className="w-5 h-5 text-zinc-500 group-hover:text-amber-500 transition-colors" />
                                </div>

                                {/* Content Card */}
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-900 hover:border-amber-500/20 transition-all backdrop-blur-sm shadow-xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <time className="font-bold text-amber-500 text-sm">{update.date}</time>
                                    </div>
                                    <h2 className="text-xl font-black text-white mb-4">{update.title}</h2>
                                    <ul className="space-y-3">
                                        {update.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3 text-zinc-400 text-sm leading-relaxed group-hover:text-zinc-300 transition-colors">
                                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 mt-2 shrink-0 group-hover:bg-amber-500/50 transition-colors" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
