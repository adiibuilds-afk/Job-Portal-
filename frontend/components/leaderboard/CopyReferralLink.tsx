'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export default function CopyReferralLink() {
    const { data: session } = useSession();
    const [copied, setCopied] = useState(false);

    if (!session) return null;

    const referralUrl = `https://jobgrid.in/join?ref=${encodeURIComponent(session.user?.email || '')}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralUrl);
        setCopied(true);
        toast.success('Referral link copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-zinc-800/50 border border-zinc-700/30 rounded-2xl p-4 mt-6">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Your Unique Referral Link</p>
            <div className="flex gap-2">
                <input
                    type="text"
                    readOnly
                    value={referralUrl}
                    className="flex-1 bg-black/40 border border-zinc-700/50 rounded-xl px-3 py-2 text-xs text-zinc-400 focus:outline-none"
                />
                <button
                    onClick={handleCopy}
                    className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${copied ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-amber-500 text-black border border-amber-600'
                        }`}
                >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
            </div>
            <p className="text-[9px] text-zinc-600 mt-2 font-medium italic">Share this to earn 10 coins per signup!</p>
        </div>
    );
}
