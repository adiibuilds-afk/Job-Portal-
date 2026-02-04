"use client";

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useSavedJobs } from '@/hooks/useSavedJobs';
import { getRecommendations } from '@/services/api';
import JobCard from './JobCard';
import { Job } from '@/types';

export default function Recommendations() {
    const { savedIds } = useSavedJobs();
    const [recommendations, setRecommendations] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (savedIds.length === 0) {
                setLoading(false);
                return;
            }

            try {
                const recs = await getRecommendations(savedIds);
                setRecommendations(recs);
            } catch (err) {
                console.error('Failed to fetch recommendations', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [savedIds]);

    if (loading) {
        return (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center">
                <div className="animate-pulse">
                    <div className="h-6 w-48 bg-zinc-800 rounded mx-auto mb-4"></div>
                    <div className="h-4 w-32 bg-zinc-800 rounded mx-auto"></div>
                </div>
            </div>
        );
    }

    if (savedIds.length === 0) {
        return (
            <div className="bg-gradient-to-r from-amber-500/5 to-yellow-500/5 border border-amber-500/20 rounded-2xl p-8 text-center">
                <Sparkles className="w-10 h-10 text-amber-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Get Personalized Recommendations</h3>
                <p className="text-zinc-400 text-sm">Save some jobs to see AI-powered recommendations based on your interests!</p>
            </div>
        );
    }

    if (recommendations.length === 0) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Recommended For You</h2>
                    <p className="text-sm text-zinc-500">Based on your saved jobs</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.slice(0, 6).map((job, idx) => (
                    <JobCard key={job._id} job={job} index={idx} />
                ))}
            </div>
        </div>
    );
}
