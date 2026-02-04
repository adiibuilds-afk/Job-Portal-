"use client";

export default function AdBanner({ slotId, className = '' }: { slotId: string; className?: string }) {
    return (
        <div className={`bg-zinc-900/60 backdrop-blur border border-zinc-800 rounded-2xl p-8 text-center min-h-[200px] flex items-center justify-center ${className}`}>
            <span className="text-xs text-zinc-600 px-3 py-1 bg-zinc-800 rounded-full">Advertisement</span>
        </div>
    );
}
