"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, Zap, Eye, MousePointer2, Clock } from 'lucide-react';

export default function JobSorter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSort = searchParams.get('sort') || 'newest';
    const [isOpen, setIsOpen] = useState(false);

    const sortOptions = [
        { value: 'newest', label: 'Newest First', icon: Clock },
        { value: 'views', label: 'Most Viewed', icon: Eye },
        { value: 'clicks', label: 'Most Applied', icon: MousePointer2 },
    ];

    const handleSort = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'newest') {
            params.delete('sort');
        } else {
            params.set('sort', value);
        }

        // Reset page to 1 whenever sort changes
        params.set('page', '1');

        router.push(`/jobs?${params.toString()}`);
        setIsOpen(false);
    };

    const activeOption = sortOptions.find(opt => opt.value === currentSort) || sortOptions[0];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors group"
            >
                <Zap className="w-3 h-3 text-amber-500 group-hover:scale-110 transition-transform" />
                <span>Sorted by: <span className="text-white font-bold">{activeOption.label}</span></span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden">
                        <div className="p-1">
                            {sortOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleSort(option.value)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${currentSort === option.value
                                            ? 'bg-zinc-800 text-white font-medium'
                                            : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                                        }`}
                                >
                                    <option.icon className={`w-4 h-4 ${currentSort === option.value ? 'text-amber-500' : 'text-zinc-500'
                                        }`} />
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
