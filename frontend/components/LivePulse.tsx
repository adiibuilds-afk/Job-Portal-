"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Users, Sparkles, TrendingUp } from 'lucide-react';

interface Activity {
    id: string;
    message: string;
    type: string;
}

export default function LivePulse() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const res = await fetch(`${API_URL}/api/live/activity`);
                const data = await res.json();
                setActivities(data);
            } catch (err) {
                console.error('Failed to fetch pulse:', err);
            }
        };

        fetchActivities();
        const interval = setInterval(fetchActivities, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (activities.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % activities.length);
        }, 5000); // Rotate every 5 seconds
        return () => clearInterval(interval);
    }, [activities]);

    if (activities.length === 0) return null;

    const current = activities[currentIndex];

    return (
        <div className="w-full bg-amber-500/5 border-y border-amber-500/10 py-2 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 flex items-center gap-4">
                <div className="flex items-center gap-2 shrink-0">
                    <div className="relative">
                        <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tighter text-amber-500/80">Live Pulse</span>
                </div>

                <div className="h-4 w-px bg-zinc-800" />

                <div className="flex-1 relative h-5">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="absolute inset-0 flex items-center gap-2"
                        >
                            <span className="text-sm font-medium text-zinc-300">
                                {current.message}
                            </span>
                            {current.type === 'job_post' && <Sparkles className="w-3 h-3 text-yellow-400" />}
                            {current.type === 'simulation' && <Users className="w-3 h-3 text-zinc-500" />}
                            {current.type === 'user_action' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
