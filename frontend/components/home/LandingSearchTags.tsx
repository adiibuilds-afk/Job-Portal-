"use client";

import { useRouter } from 'next/navigation';

interface LandingSearchTagsProps {
    tags: string[];
}

export default function LandingSearchTags({ tags }: LandingSearchTagsProps) {
    const router = useRouter();

    const handleTagClick = (tag: string, e: React.MouseEvent) => {
        e.preventDefault();

        router.push(`/jobs?q=${encodeURIComponent(tag)}`);
    };

    return (
        <div className="flex flex-wrap justify-center gap-3 mb-10">
            <span className="text-zinc-600 text-sm font-bold uppercase tracking-wider self-center">Most Searched:</span>
            {tags.map((tag) => (
                <a
                    key={tag}
                    href={`/jobs?q=${encodeURIComponent(tag)}`}
                    onClick={(e) => handleTagClick(tag, e)}
                    className="px-5 py-2.5 text-xs font-bold text-zinc-400 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 hover:text-white hover:bg-zinc-800/50 transition-all shadow-sm"
                >
                    {tag}
                </a>
            ))}
        </div>
    );
}
