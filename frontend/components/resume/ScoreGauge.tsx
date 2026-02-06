"use client";

import { motion } from 'framer-motion';

export default function ScoreGauge({ score }: { score: number }) {
    // Determine color based on score
    let color = 'text-red-500';
    let borderColor = 'border-red-500';

    if (score >= 70) {
        color = 'text-amber-400';
        borderColor = 'border-amber-400';
    }
    if (score >= 90) {
        color = 'text-green-500';
        borderColor = 'border-green-500';
    }

    return (
        <div className="relative flex flex-col items-center justify-center w-40 h-40">
            {/* Background Circle */}
            <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />

            {/* Progress Circle (Simple visualization) */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                    cx="80"
                    cy="80"
                    r="76"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className={`${color} transition-all duration-1000 ease-out`}
                    strokeDasharray={477} // 2 * PI * 76
                    strokeDashoffset={477 - (477 * score) / 100}
                    strokeLinecap="round"
                />
            </svg>

            {/* Score Text */}
            <div className={`relative z-10 flex flex-col items-center justify-center ${color}`}>
                <span className="text-4xl font-black">{score}</span>
                <span className="text-xs uppercase tracking-wider font-bold">Score</span>
            </div>
        </div>
    );
}
