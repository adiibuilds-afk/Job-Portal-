"use client";

import { useState } from 'react';
import { Bookmark, Flag, Link2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useSavedJobs } from '@/hooks/useSavedJobs';
import { reportJob } from '@/services/api';

interface JobActionsProps {
    jobId: string;
    jobTitle: string;
    jobSlug: string;
}

export default function JobActions({ jobId, jobTitle, jobSlug }: JobActionsProps) {
    const { isSaved, toggleSave } = useSavedJobs();
    const [isReported, setIsReported] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [reporting, setReporting] = useState(false);

    const saved = isSaved(jobId);

    const handleReport = async () => {
        if (isReported || reporting) return;
        setReporting(true);
        try {
            await reportJob(jobId, 'User reported from job detail page');
            setIsReported(true);
        } catch (err) {
            console.error('Failed to report job', err);
        } finally {
            setReporting(false);
        }
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}/job/${jobSlug}`;
        navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h4 className="font-bold text-white mb-4">Quick Actions</h4>

            {/* Save Job */}
            <button
                onClick={() => toggleSave(jobId)}
                className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${saved
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-amber-500/30 hover:text-amber-400'
                    }`}
            >
                <Bookmark className={`w-5 h-5 ${saved ? 'fill-amber-400' : ''}`} />
                {saved ? 'Saved to Bookmarks' : 'Save Job'}
            </button>

            {/* Copy Link */}
            <button
                onClick={handleCopyLink}
                className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${isCopied
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-green-500/30 hover:text-green-400'
                    }`}
            >
                {isCopied ? (
                    <>
                        <CheckCircle className="w-5 h-5" />
                        Link Copied!
                    </>
                ) : (
                    <>
                        <Link2 className="w-5 h-5" />
                        Copy Job Link
                    </>
                )}
            </button>

            {/* Report Job */}
            <button
                onClick={handleReport}
                disabled={isReported || reporting}
                className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${isReported
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20 cursor-not-allowed'
                        : 'bg-zinc-800/50 text-zinc-500 border border-zinc-700/50 hover:border-red-500/30 hover:text-red-400'
                    }`}
            >
                {isReported ? (
                    <>
                        <AlertTriangle className="w-5 h-5" />
                        Reported
                    </>
                ) : (
                    <>
                        <Flag className="w-5 h-5" />
                        {reporting ? 'Reporting...' : 'Report Issue'}
                    </>
                )}
            </button>
        </div>
    );
}
