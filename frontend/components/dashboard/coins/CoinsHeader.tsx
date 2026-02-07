import { motion } from 'framer-motion';
import { Coins, Copy, Check, Share2 } from 'lucide-react';
import { CoinsData } from './types';
import { TIER_COLORS, TIER_ICONS } from './constants';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface CoinsHeaderProps {
    data: CoinsData | null;
}

export default function CoinsHeader({ data }: CoinsHeaderProps) {
    const [copied, setCopied] = useState(false);

    const UserTierIcon = TIER_ICONS[data?.tier || 'Bronze'];
    const refsNeeded = (data?.referralCount || 0) >= 25 ? 0 : (data?.referralCount || 0) >= 10 ? 25 : (data?.referralCount || 0) >= 3 ? 10 : 3;
    const nextTier = (data?.referralCount || 0) >= 25 ? 'Diamond' : (data?.referralCount || 0) >= 10 ? 'Diamond' : (data?.referralCount || 0) >= 3 ? 'Gold' : 'Silver';
    const progressPercent = refsNeeded === 0 ? 100 : Math.min(100, ((data?.referralCount || 0) / refsNeeded) * 100);

    const copyCode = () => {
        navigator.clipboard.writeText(data?.referralCode || '');
        setCopied(true);
        toast.success('Code copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const copyReferralLink = () => {
        const link = `https://jobgrid.in/join?ref=${data?.referralCode}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        toast.success('Referral link copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="md:col-span-2 bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 rounded-3xl p-8 flex items-center justify-between overflow-hidden relative"
            >
                <div className="relative z-10">
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-2">Available Balance</p>
                    <h2 className="text-6xl font-black text-white flex items-center gap-3">
                        {data?.balance?.toFixed(1) || 0}
                        <span className="text-amber-500 text-3xl">🪙</span>
                    </h2>
                    <div className="flex gap-2 mt-6">
                        {(data?.badges || []).map((badge, i) => (
                            <span key={i} className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold rounded-full uppercase tracking-tighter">
                                {badge}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="text-right relative z-10">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-2xl border border-zinc-700 mb-2 ${TIER_COLORS[data?.tier || 'Bronze']}`}>
                        <UserTierIcon className="w-5 h-5" />
                        <span className="font-black italic text-lg">{data?.tier} Tier</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-zinc-500 text-[10px] font-bold uppercase">Next Tier: {nextTier}</p>
                        <div className="w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden ml-auto">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${progressPercent}%` }} />
                        </div>
                        <p className="text-[9px] text-zinc-600 font-medium">{data?.referralCount}/{refsNeeded} referrals</p>
                    </div>
                </div>
                <Coins className="absolute -right-10 -bottom-10 w-64 h-64 text-amber-500/5 rotate-12" />
            </motion.div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-4">Refer & Earn</p>
                <div className="space-y-4">
                    <div className="bg-black/40 border border-zinc-800 rounded-2xl p-4 text-center">
                        <p className="text-zinc-600 text-[10px] font-bold mb-1">YOUR CODE</p>
                        <span className="text-3xl font-mono font-black text-amber-500 tracking-widest">{data?.referralCode}</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={copyCode}
                            className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-black rounded-2xl font-black transition-all flex items-center justify-center gap-2 text-xs"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            CODE
                        </button>
                        <button
                            onClick={copyReferralLink}
                            className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2 text-xs"
                        >
                            <Share2 className="w-4 h-4" />
                            LINK
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
