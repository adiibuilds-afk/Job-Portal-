'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Coins, Users, Copy, Check, Share2, Flame, Gift } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Transaction {
    _id: string;
    amount: number;
    reason: string;
    description: string;
    createdAt: string;
}

interface CoinsData {
    balance: number;
    referralCode: string;
    referralCount: number;
    loginStreak: number;
    transactions: Transaction[];
}

export default function GridCoinsWidget() {
    const { data: session } = useSession();
    const [coinsData, setCoinsData] = useState<CoinsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (session?.user?.email) {
            fetchCoins();
            trackLogin();
        }
    }, [session?.user?.email]);

    const fetchCoins = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/coins?email=${session?.user?.email}`);
            const data = await res.json();
            setCoinsData(data);
        } catch (err) {
            console.error('Failed to fetch coins:', err);
        } finally {
            setLoading(false);
        }
    };

    const trackLogin = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/coins/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: session?.user?.email })
            });
        } catch (err) {
            // Silent fail
        }
    };

    const copyReferralLink = () => {
        const link = `https://jobgrid.in/join?ref=${coinsData?.referralCode}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        toast.success('Referral link copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    if (!session) return null;

    if (loading) {
        return (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 animate-pulse">
                <div className="h-20 bg-zinc-800 rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-amber-950/20 border border-amber-500/20 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 p-6 border-b border-amber-500/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                            <Coins className="w-6 h-6 text-black" />
                        </div>
                        <div>
                            <p className="text-zinc-400 text-sm">Your Balance</p>
                            <p className="text-3xl font-black text-amber-400">
                                {coinsData?.balance?.toFixed(1) || 0} <span className="text-lg">🪙</span>
                            </p>
                        </div>
                    </div>

                    {/* Streak Badge */}
                    {(coinsData?.loginStreak || 0) > 0 && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                            <Flame className="w-4 h-4 text-orange-500" />
                            <span className="text-orange-400 font-bold">{coinsData?.loginStreak}/7</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Referral Section */}
            <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Gift className="w-4 h-4 text-amber-500" />
                    <span>Invite friends, earn <span className="text-amber-400 font-bold">5 coins</span> each!</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl font-mono text-amber-400 text-lg tracking-wider">
                        {coinsData?.referralCode || '------'}
                    </div>
                    <button
                        onClick={copyReferralLink}
                        className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-xl font-bold flex items-center gap-2 transition-colors"
                    >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-zinc-800/50 rounded-xl text-center">
                        <Users className="w-5 h-5 text-green-400 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-white">{coinsData?.referralCount || 0}</p>
                        <p className="text-xs text-zinc-500">Referrals</p>
                    </div>
                    <div className="p-3 bg-zinc-800/50 rounded-xl text-center">
                        <Share2 className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-white">2🪙</p>
                        <p className="text-xs text-zinc-500">Per Share</p>
                    </div>
                </div>

                {/* Recent Transactions */}
                {coinsData?.transactions && coinsData.transactions.length > 0 && (
                    <div className="pt-4 border-t border-zinc-800">
                        <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Recent Activity</p>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {coinsData.transactions.slice(0, 3).map((tx) => (
                                <div key={tx._id} className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-400">{tx.description}</span>
                                    <span className="text-green-400 font-bold">+{tx.amount}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
