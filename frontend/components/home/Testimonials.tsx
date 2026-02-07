"use client";

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
    {
        name: "Arjun Sharma",
        role: "SDE @ Amazon",
        batch: "2024 Batch",
        avatar: "AS",
        quote: "Found my dream role within 2 weeks. The batch-wise filtering saved me hours of scrolling through irrelevant posts.",
        rating: 5
    },
    {
        name: "Priya Patel",
        role: "Frontend Developer @ Flipkart",
        batch: "2025 Batch",
        avatar: "PP",
        quote: "The AI Resume Scorer helped me optimize my resume and I started getting callbacks immediately. Highly recommend!",
        rating: 5
    },
    {
        name: "Rahul Verma",
        role: "Data Engineer @ Google",
        batch: "2023 Batch",
        avatar: "RV",
        quote: "Telegram alerts are a game-changer. I applied within minutes of a new opening and got the interview.",
        rating: 5
    }
];

export default function Testimonials() {
    return (
        <section className="py-24 px-4 bg-black relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px]"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 mb-4"
                    >
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Success Stories</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black text-white mb-4"
                    >
                        Engineers <span className="text-amber-500">Love</span> JobGrid
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-500 max-w-xl mx-auto"
                    >
                        Join thousands of engineers who landed their dream roles through our platform.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.15 }}
                            className="relative p-8 rounded-3xl bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 hover:border-amber-500/20 transition-all duration-500 group"
                        >
                            <Quote className="absolute top-6 right-6 w-8 h-8 text-amber-500/10 group-hover:text-amber-500/20 transition-colors" />

                            {/* Rating */}
                            <div className="flex gap-1 mb-6">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                                ))}
                            </div>

                            {/* Quote */}
                            <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                                "{testimonial.quote}"
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center text-black font-black text-sm">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <div className="font-bold text-white">{testimonial.name}</div>
                                    <div className="text-xs text-zinc-500">{testimonial.role}</div>
                                    <div className="text-[10px] text-amber-500/70 font-bold uppercase tracking-wider mt-1">{testimonial.batch}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
