"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

interface Job {
    _id: string;
    title: string;
    company: string;
    slug: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jobgrid-in.onrender.com';

export default function LatestJobsTicker() {
    const [jobs, setJobs] = useState<Job[]>([]);

    useEffect(() => {
        fetch(`${API_URL}/api/jobs?limit=5`)
            .then(res => res.json())
            .then(data => setJobs(data.jobs || []))
            .catch(err => console.error('Ticker fetch error:', err));
    }, []);

    if (jobs.length === 0) return null;

    return (
        <div className="bg-amber-500/10 border-y border-amber-500/20 py-2 relative overflow-hidden group">
            <div className="max-w-7xl mx-auto px-6 flex items-center gap-4">

                {/* Label */}
                <div className="flex items-center gap-2 bg-amber-500 text-black px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter z-10">
                    <Sparkles className="w-3 h-3" />
                    Just Posted
                </div>

                {/* Ticker Animation */}
                <div className="flex-1 overflow-hidden whitespace-nowrap mask-edges">
                    <div className="inline-block animate-ticker-slow hover:pause-animation">
                        {jobs.map((job) => (
                            <Link
                                key={job._id}
                                href={`/job/${job.slug}`}
                                className="inline-block mx-8 text-zinc-300 text-sm font-medium hover:text-amber-500 transition-colors"
                            >
                                <span className="text-amber-500/50 mr-2">/</span>
                                {job.title} at <span className="font-bold text-white">{job.company}</span>
                            </Link>
                        ))}
                        {/* Duplicate for seamless loop */}
                        {jobs.map((job) => (
                            <Link
                                key={`${job._id}-clone`}
                                href={`/job/${job.slug}`}
                                className="inline-block mx-8 text-zinc-300 text-sm font-medium hover:text-amber-500 transition-colors"
                            >
                                <span className="text-amber-500/50 mr-2">/</span>
                                {job.title} at <span className="font-bold text-white">{job.company}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
        .animate-ticker-slow {
          animation: ticker 30s linear infinite;
        }
        .pause-animation {
          animation-play-state: paused;
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .mask-edges {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>
        </div>
    );
}
