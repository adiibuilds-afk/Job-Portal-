"use client";

import { motion } from 'framer-motion';
import {
    Zap,
    Target,
    Coins,
    Bell,
    FileSearch,
    MessageSquare,
    ShieldCheck,
    Rocket
} from 'lucide-react';

const features = [
    {
        title: "AI Resume Scorer",
        description: "Get instant scores and personalized feedback to beat the ATS and land more interviews.",
        icon: FileSearch,
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20"
    },
    {
        title: "Grid Coins System",
        description: "Earn coins for your daily activity. Redeem them for premium features and higher visibility.",
        icon: Coins,
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20"
    },
    {
        title: "Batch-Wise Targeting",
        description: "Custom feeds for 2024, 2025, 2026, 2027, and 2028 batches. Never miss a relevant opening again.",
        icon: Target,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20"
    },
    {
        title: "Instant Job Alerts",
        description: "Join our active Telegram channel for real-time notifications about the latest tech openings.",
        icon: Bell,
        color: "text-green-400",
        bg: "bg-green-500/10",
        border: "border-green-500/20"
    },
    {
        title: "Direct Applied Tracking",
        description: "Keep track of every application status in one place. Toggle applied/rejected with ease.",
        icon: ShieldCheck,
        color: "text-cyan-400",
        bg: "bg-cyan-500/10",
        border: "border-cyan-500/20"
    },
    {
        title: "AI-Powered Matching",
        description: "Our recommendation engine finds jobs that match your skills perfectly while you sleep.",
        icon: Zap,
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20"
    }
];

import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function FeatureShowcase() {
    const { data: session } = useSession();
    const router = useRouter();

    const handleFeatureClick = (title: string) => {
        // Special handling for Telegram feature
        if (title === "Instant Job Alerts") {
            window.open('https://t.me/jobgridupdates', '_blank');
            return;
        }

        if (!session) {
            toast.error(`Please login to access ${title}`, { icon: '🔒' });
            return;
        }
        // If logged in, they are redirected anyway, but if they click from some other state:
        router.push('/jobs');
    };

    return (
        <section className="py-24 px-4 relative overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 mb-4"
                    >
                        <Rocket className="w-4 h-4 text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Platform Features</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black text-white mb-4"
                    >
                        Everything you need to <span className="text-amber-500">get hired</span>.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-500 max-w-2xl mx-auto"
                    >
                        We've built a complete ecosystem to simplify your job search journey.
                        No more tracking applications in spreadsheets.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => handleFeatureClick(feature.title)}
                            className="group p-8 rounded-3xl bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 hover:border-amber-500/30 transition-all duration-300 relative cursor-pointer active:scale-95"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <feature.icon className={`w-24 h-24 ${feature.color}`} />
                            </div>

                            <div className={`w-14 h-14 rounded-2xl ${feature.bg} border ${feature.border} flex items-center justify-center mb-6`}>
                                <feature.icon className={`w-7 h-7 ${feature.color}`} />
                            </div>

                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
                                {feature.title}
                            </h3>

                            <p className="text-zinc-500 text-sm leading-relaxed">
                                {feature.description}
                            </p>

                            <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-amber-500/40 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                Explore <MessageSquare className="w-3 h-3" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
