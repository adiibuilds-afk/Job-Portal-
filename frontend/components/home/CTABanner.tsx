"use client";

import { motion } from 'framer-motion';
import { ArrowRight, Users, Zap } from 'lucide-react';
import Link from 'next/link';

export default function CTABanner() {
    return (
        <section className="py-20 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="max-w-5xl mx-auto relative overflow-hidden"
            >
                <div className="relative p-1 rounded-3xl bg-gradient-to-r from-amber-500/50 via-yellow-500/30 to-amber-500/50">
                    <div className="bg-zinc-950 rounded-[22px] p-12 md:p-16 text-center relative overflow-hidden">
                        {/* Background glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-amber-500/10 rounded-full blur-[80px]"></div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8">
                                <Users className="w-4 h-4 text-amber-500" />
                                <span className="text-sm font-bold text-amber-400">Join 25K+ Engineers</span>
                            </div>

                            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                                Ready to Land Your <br className="hidden md:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400">Dream Tech Role?</span>
                            </h2>

                            <p className="text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed">
                                Create your free account and get personalized job recommendations,
                                AI resume scoring, and instant Telegram alerts.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/api/auth/signin"
                                    className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-lg rounded-2xl shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    <Zap className="w-5 h-5" />
                                    Get Started Free
                                </Link>

                                <Link
                                    href="/jobs"
                                    className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-zinc-900 border border-zinc-800 text-white font-bold text-lg rounded-2xl hover:border-amber-500/30 hover:text-amber-400 transition-all"
                                >
                                    View All Jobs
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
