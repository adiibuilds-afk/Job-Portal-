"use client";

import { motion } from 'framer-motion';

const companies = [
    "Google", "Amazon", "Microsoft", "Netflix", "Adobe",
    "Uber", "Meta", "Apple", "Zomato", "Swiggy",
    "Goldman Sachs", "Intuit"
];

export default function LogoCloud() {
    // Multiply for smooth loop
    const duplicatedCompanies = [...companies, ...companies];

    return (
        <div className="py-20 relative overflow-hidden bg-black">
            <div className="max-w-6xl mx-auto px-4 mb-10 text-center">
                <span className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]">
                    Top Engineers from JobGrid land at
                </span>
            </div>

            <div className="flex overflow-hidden group">
                <motion.div
                    animate={{ x: [0, -1000] }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="flex gap-20 items-center justify-around min-w-full"
                >
                    {duplicatedCompanies.map((name, i) => (
                        <div
                            key={i}
                            className="text-2xl md:text-3xl font-black text-zinc-800 hover:text-amber-500/50 transition-colors cursor-default whitespace-nowrap"
                        >
                            {name}
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Gradient Mask */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10"></div>
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10"></div>
        </div>
    );
}
