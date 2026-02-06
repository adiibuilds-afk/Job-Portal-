'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Coins, Users, Copy, Check, Share2, Flame, Gift, History as HistoryIcon,
    Trophy, TrendingUp, Info, ShoppingBag, Sparkles, Rocket,
    Box, Award, Medal, Crown, Star, Code, Globe, Mic,
    Zap, Heart
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Transaction {
    _id: string;
    amount: number;
    reason: string;
    description: string;
    createdAt: string;
}

interface LeaderboardUser {
    _id: string;
    name: string;
    email: string;
    referralCount: number;
    tier: string;
    badges: string[];
}

interface CoinsData {
    balance: number;
    referralCode: string;
    referralCount: number;
    loginStreak: number;
    transactions: Transaction[];
    tier: string;
    badges: string[];
    profileRewardsClaimed: string[];
    skills: string[];
    portfolioUrl: string;
}

const STORE_PERKS = [
    { id: 'ai_scan', name: 'AI Resume Scan', cost: 10, icon: Sparkles, desc: 'Unlock 1 deep AI analysis of your resume.' },
    { id: 'mystery_box', name: 'Mystery Box', cost: 20, icon: Box, desc: 'Win between 5 to 50 coins instantly!' },
    { id: 'mock_interview', name: 'AI Mock Interview', cost: 50, icon: Mic, desc: 'Practice your skills with a realistic AI interviewer.', inDevelopment: true },
];

const COIN_EARN_METHODS = [
    { action: 'Signup with referral', amount: '+2.5', icon: Gift },
    { action: 'Refer a friend', amount: '+5.0', icon: Users },
    { action: '7-day login streak', amount: '+10', icon: Flame },
    { action: 'Share job (Social)', amount: '+2.0', icon: Share2 },
    { action: 'Complete Profile', amount: '+5.0', icon: Award },
];

const PROFILE_REWARDS = [
    { id: 'skills', name: 'Add Skills', amount: 3, icon: Code, check: (data: CoinsData) => (data.skills || []).length > 0 },
    { id: 'portfolio', name: 'Add Portfolio', amount: 2, icon: Globe, check: (data: CoinsData) => !!data.portfolioUrl },
];

const TIER_COLORS: Record<string, string> = {
    Bronze: 'text-orange-400',
    Silver: 'text-zinc-300',
    Gold: 'text-amber-400',
    Diamond: 'text-blue-400',
};

const TIER_ICONS: Record<string, any> = {
    Bronze: Medal,
    Silver: Award,
    Gold: Crown,
    Diamond: Star,
};

export default function GridCoinsTab() {
    const { data: session } = useSession();
    const [coinsData, setCoinsData] = useState<CoinsData | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [redeeming, setRedeeming] = useState<string | null>(null);

    useEffect(() => {
        if (session?.user?.email) {
            fetchAllData();
            trackLogin();
        }
    }, [session?.user?.email]);

    const fetchAllData = async () => {
        try {
            const [coinsRes, leaderRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/coins?email=${session?.user?.email}`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/leaderboard`)
            ]);

            const coins = await coinsRes.json();
            const leader = await leaderRes.json();

            setCoinsData(coins);
            setLeaderboard(leader.leaderboard || []);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    const trackLogin = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/coins/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: session?.user?.email })
            });
            const data = await res.json();
            if (data.coinsAwarded) {
                toast.success(data.message, { icon: '🔥' });
                fetchAllData();
            }
        } catch (err) { /* silent */ }
    };

    const handleRedeem = async (perkId: string) => {
        setRedeeming(perkId);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/coins/redeem`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: session?.user?.email, perk: perkId })
            });
            const data = await res.json();

            if (data.success) {
                toast.success(data.message, { icon: '🎁' });
                if (data.mysteryReward) {
                    toast.success(`You won ${data.mysteryReward} coins!`, { icon: '💰', duration: 5000 });
                }
                fetchAllData();
            } else {
                toast.error(data.error || 'Redemption failed');
            }
        } catch (err) {
            toast.error('Something went wrong');
        } finally {
            setRedeeming(null);
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(coinsData?.referralCode || '');
        setCopied(true);
        toast.success('Code copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const copyReferralLink = () => {
        const code = coinsData?.referralCode;
        if (!code) {
            toast.error('Referral code not loaded. Please refresh.');
            return;
        }
        const link = `https://jobgrid.in/join?ref=${code}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        toast.success('Referral link copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const claimProfileReward = async (type: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/coins/profile-award`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: session?.user?.email, type })
            });
            const data = await res.json();

            if (data.success) {
                toast.success(`Claimed ${data.amount} coins!`, { icon: '💰' });
                fetchAllData();
            } else {
                toast.error(data.message || 'Claim failed');
            }
        } catch (err) {
            toast.error('Something went wrong');
        }
    };

    if (!session) return null;

    if (loading) {
        return <div className="p-8 text-center text-zinc-500 animate-pulse">Loading Economy...</div>;
    }

    const UserTierIcon = TIER_ICONS[coinsData?.tier || 'Bronze'];
    const lifetimeEarnings = coinsData?.transactions?.reduce((acc, tx) => tx.amount > 0 ? acc + tx.amount : acc, 0) || 0;

    const refsNeeded = (coinsData?.referralCount || 0) >= 25 ? 0 : (coinsData?.referralCount || 0) >= 10 ? 25 : (coinsData?.referralCount || 0) >= 3 ? 10 : 3;
    const nextTier = (coinsData?.referralCount || 0) >= 25 ? 'Diamond' : (coinsData?.referralCount || 0) >= 10 ? 'Diamond' : (coinsData?.referralCount || 0) >= 3 ? 'Gold' : 'Silver';
    const progressPercent = refsNeeded === 0 ? 100 : Math.min(100, ((coinsData?.referralCount || 0) / refsNeeded) * 100);

    return (
        <div className="space-y-8 pb-20">
            {/* Top Bar: Balance & Tier */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="md:col-span-2 bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 rounded-3xl p-8 flex items-center justify-between overflow-hidden relative"
                >
                    <div className="relative z-10">
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-2">Available Balance</p>
                        <h2 className="text-6xl font-black text-white flex items-center gap-3">
                            {coinsData?.balance?.toFixed(1) || 0}
                            <span className="text-amber-500 text-3xl">🪙</span>
                        </h2>
                        <div className="flex gap-2 mt-6">
                            {(coinsData?.badges || []).map((badge, i) => (
                                <span key={i} className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold rounded-full uppercase tracking-tighter">
                                    {badge}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="text-right relative z-10">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-2xl border border-zinc-700 mb-2 ${TIER_COLORS[coinsData?.tier || 'Bronze']}`}>
                            <UserTierIcon className="w-5 h-5" />
                            <span className="font-black italic text-lg">{coinsData?.tier} Tier</span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-zinc-500 text-[10px] font-bold uppercase">Next Tier: {nextTier}</p>
                            <div className="w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden ml-auto">
                                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${progressPercent}%` }} />
                            </div>
                            <p className="text-[9px] text-zinc-600 font-medium">{coinsData?.referralCount}/{refsNeeded} referrals</p>
                        </div>
                    </div>
                    {/* Decorative Icon */}
                    <Coins className="absolute -right-10 -bottom-10 w-64 h-64 text-amber-500/5 rotate-12" />
                </motion.div>

                {/* Referral Quick Card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-4">Refer & Earn</p>
                    <div className="space-y-4">
                        <div className="bg-black/40 border border-zinc-800 rounded-2xl p-4 text-center">
                            <p className="text-zinc-600 text-[10px] font-bold mb-1">YOUR CODE</p>
                            <span className="text-3xl font-mono font-black text-amber-500 tracking-widest">{coinsData?.referralCode}</span>
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

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Store Section */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Completion Rewards */}
                    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-black text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-indigo-400" />
                                Profile Rewards
                            </h3>
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Complete to Earn</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {PROFILE_REWARDS.map((reward) => {
                                const isClaimed = coinsData?.profileRewardsClaimed?.includes(reward.id);
                                const isMet = reward.check(coinsData as any);
                                return (
                                    <div key={reward.id} className="flex items-center justify-between p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isClaimed ? 'bg-zinc-800 text-zinc-500' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                                <reward.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{reward.name}</p>
                                                <p className="text-[10px] text-zinc-500">Award: +{reward.amount} 🪙</p>
                                            </div>
                                        </div>
                                        <button
                                            disabled={isClaimed || !isMet}
                                            onClick={() => claimProfileReward(reward.id)}
                                            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${isClaimed
                                                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                                : isMet
                                                    ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                                                }`}
                                        >
                                            {isClaimed ? 'CLAIMED' : isMet ? 'CLAIM' : 'INCOMPLETE'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black text-white flex items-center gap-3">
                            <ShoppingBag className="w-6 h-6 text-amber-500" />
                            Redeem Store
                        </h3>
                        <span className="text-zinc-500 text-xs font-bold uppercase">Spend your coins</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {STORE_PERKS.map((perk) => (
                            <motion.div
                                key={perk.id}
                                whileHover={{ y: -5 }}
                                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col items-center text-center group"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-black transition-colors duration-500">
                                    <perk.icon className="w-8 h-8" />
                                </div>
                                <h4 className="font-black text-white mb-2">{perk.name}</h4>
                                <p className="text-xs text-zinc-500 mb-6 leading-relaxed">{perk.desc}</p>
                                <button
                                    disabled={redeeming === perk.id || (coinsData?.balance || 0) < perk.cost}
                                    onClick={() => handleRedeem(perk.id)}
                                    className={`mt-auto w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${(coinsData?.balance || 0) >= perk.cost
                                        ? 'bg-zinc-800 hover:bg-white hover:text-black text-white border border-zinc-700'
                                        : 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800'
                                        }`}
                                >
                                    {redeeming === perk.id ? '...' : <><Coins className="w-4 h-4" /> {perk.cost}</>}
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    {/* Transaction History */}
                    <div className="pt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-black text-zinc-400 flex items-center gap-2">
                                <HistoryIcon className="w-5 h-5" />
                                Recent activity
                            </h3>
                            <p className="text-xs font-bold text-zinc-600">Total Earned: {lifetimeEarnings.toFixed(1)} 🪙</p>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden">
                            {(coinsData?.transactions || []).length > 0 ? (
                                <div className="divide-y divide-zinc-800">
                                    {(coinsData?.transactions || []).slice(0, 10).map((tx) => (
                                        <div key={tx._id} className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${tx.amount > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {tx.amount > 0 ? '+' : '-'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white tracking-tight">{tx.description}</p>
                                                    <p className="text-[10px] text-zinc-600 font-mono italic uppercase">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className={`font-black ${tx.amount > 0 ? 'text-green-400' : 'text-zinc-500'}`}>
                                                {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-10 text-center text-zinc-700 italic font-medium">No transactions found</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Leaderboard Column */}
                <div className="space-y-6">
                    <h3 className="text-2xl font-black text-white flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-green-500" />
                        Leaderboard
                    </h3>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                        <div className="p-4 bg-zinc-800/50 border-b border-zinc-800 flex justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                            <span>User</span>
                            <span>Points</span>
                        </div>
                        <div className="divide-y divide-zinc-800">
                            {leaderboard.map((user, idx) => (
                                <div key={user._id} className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-6 text-xs font-black italic ${idx < 3 ? 'text-amber-500' : 'text-zinc-600'}`}>
                                            #{idx + 1}
                                        </span>
                                        <div>
                                            <p className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate max-w-[120px]">
                                                {user.name}
                                            </p>
                                            <p className={`text-[10px] font-bold uppercase italic ${TIER_COLORS[user.tier || 'Bronze']}`}>
                                                {user.tier}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-white">{user.referralCount * 5}</p>
                                        <p className="text-[9px] text-zinc-600 font-bold uppercase">{user.referralCount} refs</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-3xl">
                        <p className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                            <Flame className="w-4 h-4 text-orange-500" />
                            Referral Master
                        </p>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            Refer 3 friends to hit <span className="text-zinc-300 font-bold italic">Silver</span>, 10 for <span className="text-amber-400 font-bold italic">Gold</span>, and 25 for <span className="text-blue-400 font-bold italic">Diamond</span>!
                        </p>
                    </div>

                    {/* How to Earn List */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                        <h3 className="text-white font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-500" />
                            Ways to Earn
                        </h3>
                        <div className="space-y-3">
                            {COIN_EARN_METHODS.map((method, idx) => (
                                <div key={idx} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-500 group-hover:bg-amber-500/10 group-hover:text-amber-500 transition-colors">
                                            <method.icon className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-xs text-zinc-400 font-medium group-hover:text-white transition-colors">{method.action}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-amber-500 group-hover:scale-110 transition-transform">{method.amount} 🪙</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
