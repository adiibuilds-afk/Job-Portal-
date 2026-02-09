"use client";

import { useState } from 'react';
import { Bookmark, Flag, Link2, CheckCircle, AlertTriangle, FileText, Share2 } from 'lucide-react';
import { useSavedJobs } from '@/hooks/useSavedJobs';
import { useAppliedJobs } from '@/hooks/useAppliedJobs';
import { reportJob } from '@/services/api';

import { useSession, signIn } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface JobActionsProps {
    jobId: string;
    jobTitle: string;
    jobSlug: string;
}

export default function JobActions({ jobId, jobTitle, jobSlug }: JobActionsProps) {
    const { data: session } = useSession();
    const { isSaved, toggleSave } = useSavedJobs();
    const [isReported, setIsReported] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [reporting, setReporting] = useState(false);

    const saved = isSaved(jobId);

    const handleReport = async () => {
        if (!session) {
            toast.error('Please login to report jobs.', { icon: '🔒' });
            return;
        }
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
        toast.success('Link copied to clipboard!');
        setTimeout(() => setIsCopied(false), 2000);
    };

    const { isApplied, markAsApplied } = useAppliedJobs();
    const applied = isApplied(jobId);

    const handleMarkApplied = () => {
        if (!session) {
            toast.error('Please login to track your applications.', { icon: '🔒' });
            return;
        }
        markAsApplied(jobId);
    };

    return (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h4 className="font-bold text-white mb-4">Quick Actions</h4>

            {/* Mark as Applied */}
            <button
                onClick={handleMarkApplied}
                disabled={applied}
                className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${applied
                    ? 'bg-green-500 text-black border border-green-500 scale-100 cursor-default'
                    : 'bg-white text-black border border-white hover:scale-105 transition-transform'
                    }`}
            >
                {applied ? (
                    <>
                        <CheckCircle className="w-5 h-5" />
                        Applied ✅
                    </>
                ) : (
                    <>
                        <CheckCircle className="w-5 h-5" />
                        Mark as Applied
                    </>
                )}
            </button>

            {/* Save Job */}
            <button
                onClick={() => {
                    if (!session) {
                        toast.error('Please login to save jobs.', { icon: '🔒' });
                        return;
                    }
                    toggleSave(jobId);
                }}
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
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-blue-500/30 hover:text-blue-400'
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

            {/* Share on WhatsApp */}
            <button
                onClick={() => {
                    const user = session?.user as any;
                    const url = `${window.location.origin}/job/${jobSlug}${user?.id ? `?ref=${user.referralCode || ''}` : ''}`;
                    const message = `🚀 *New Job Opening!* \n\n*${jobTitle}*\n🏢 *Company:* ${jobTitle.split('at')[1] || 'Click to see'}\n📍 *Apply here:* ${url}\n\n_Shared via JobGrid - #1 Engineering Job Portal_`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');

                    // Award coins for sharing
                    if (session) {
                        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                        fetch(`${API_URL}/api/user/coins/share`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: session.user?.email })
                        }).catch(e => console.error('Share reward error:', e));
                    }
                }}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-semibold bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366]/20 transition-all"
            >
                <div className="w-5 h-5 flex items-center justify-center bg-[#25D366] rounded-full">
                    <Share2 className="w-3 h-3 text-white fill-white" />
                </div>
                Share on WhatsApp
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
