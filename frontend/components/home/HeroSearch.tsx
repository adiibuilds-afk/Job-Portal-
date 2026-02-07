"use client";

import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Search, TrendingUp } from 'lucide-react';
import { useState } from 'react';

export default function HeroSearch() {
    const { data: session } = useSession();
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [location, setLocation] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        if (!session) {
            toast.error("Please login to search for jobs", { icon: '🔒' });
            return;
        }

        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (location) params.append('location', location);

        router.push(`/jobs?${params.toString()}`);
    };

    return (
        <div className="max-w-3xl mx-auto mb-12">
            <form onSubmit={handleSearch}>
                <div className="relative p-1 rounded-2xl bg-gradient-to-r from-amber-500/50 via-yellow-500/50 to-amber-500/50 shadow-2xl shadow-amber-500/10">
                    <div className="bg-black rounded-xl p-2 flex flex-col md:flex-row items-center gap-2">
                        <div className="flex-1 flex items-center px-5 py-4 w-full">
                            <Search className="w-5 h-5 text-amber-500 mr-4" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search roles (e.g. React, Java, SDE)..."
                                className="w-full bg-transparent text-white placeholder:text-zinc-500 outline-none text-lg"
                            />
                        </div>
                        <div className="hidden md:block w-px h-10 bg-zinc-800"></div>
                        <div className="flex-1 flex items-center px-5 py-4 w-full">
                            <TrendingUp className="w-5 h-5 text-amber-500 mr-4" />
                            <select
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full bg-transparent text-white outline-none text-lg cursor-pointer"
                            >
                                <option value="" className="bg-black text-zinc-500">Any Location</option>
                                <option value="remote" className="bg-black text-white">Remote</option>
                                <option value="bangalore" className="bg-black text-white">Bangalore</option>
                                <option value="hyderabad" className="bg-black text-white">Hyderabad</option>
                                <option value="pune" className="bg-black text-white">Pune</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-lg rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-95 transition-all">
                            Search
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
