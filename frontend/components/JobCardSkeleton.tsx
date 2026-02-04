"use client";

export default function JobCardSkeleton() {
    return (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 animate-pulse">
            <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-800"></div>
                <div className="flex-1">
                    <div className="h-5 bg-zinc-800 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
                </div>
            </div>
            <div className="flex gap-2 mb-4">
                <div className="h-8 bg-zinc-800 rounded-lg w-20"></div>
                <div className="h-8 bg-zinc-800 rounded-lg w-24"></div>
                <div className="h-8 bg-zinc-800 rounded-lg w-16"></div>
            </div>
            <div className="flex items-center justify-between">
                <div className="h-6 bg-zinc-800 rounded-full w-16"></div>
                <div className="h-10 bg-zinc-800 rounded-xl w-24"></div>
            </div>
        </div>
    );
}
