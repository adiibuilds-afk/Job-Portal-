'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

import { CoinsData, LeaderboardUser } from './coins/types';
import CoinsHeader from './coins/CoinsHeader';
import ProfileRewards from './coins/ProfileRewards';
import RedeemStore from './coins/RedeemStore';
import HistoryTab from './coins/HistoryTab';
import LeaderboardTab from './coins/LeaderboardTab';

export default function GridCoinsTab() {
    const { data: session } = useSession();
    const [coinsData, setCoinsData] = useState<CoinsData | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);
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
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/coins/leaderboard`)
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
        } catch (err) { }
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
                if (data.mysteryReward) toast.success(`You won ${data.mysteryReward} coins!`, { icon: '💰', duration: 5000 });
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
    if (loading) return <div className="p-8 text-center text-zinc-500 animate-pulse">Loading Economy...</div>;

    return (
        <div className="space-y-8 pb-20">
            <CoinsHeader data={coinsData} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <ProfileRewards data={coinsData} onClaim={claimProfileReward} />
                    <RedeemStore data={coinsData} redeeming={redeeming} onRedeem={handleRedeem} />
                    <HistoryTab transactions={coinsData?.transactions || []} />
                </div>
                <LeaderboardTab leaderboard={leaderboard} />
            </div>
        </div>
    );
}
