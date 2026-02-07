"use client";

import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface LandingSearchTagsProps {
    tags: string[];
}

export default function LandingSearchTags({ tags }: LandingSearchTagsProps) {
    const { data: session } = useSession();
    const router = useRouter();

    const handleTagClick = (tag: string, e: React.MouseEvent) => {
        e.preventDefault();

        // If it's a batch-specific tag, we definitely want to prompt for login
        // But for consistency with the user's request "same for Jobs for your Batch", 
        // let's prompt for all tags on the landing page since it's a "wow" gate.
        if (!session) {
            toast.error(`Please login to view ${tag} collections`, { icon: '🔒' });
            return;
        }

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
