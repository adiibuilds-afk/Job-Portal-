'use client';

import { LeaderboardUser } from '@/components/dashboard/coins/types';
import { TIER_COLORS } from '@/components/dashboard/coins/constants';
import { Award } from 'lucide-react';

export default function LeaderboardCard({ user, rank }: { user: LeaderboardUser; rank: number }) {
    const isTop3 = rank <= 3;

    return (
        <div className="p-6 flex items-center justify-between hover:bg-zinc-800/20 transition-all group">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg ${rank === 1 ? 'bg-amber-500 text-black' :
                        rank === 2 ? 'bg-zinc-300 text-black' :
                            rank === 3 ? 'bg-orange-400 text-black' :
                                'bg-zinc-800 text-zinc-500'
                    }`}>
                    {rank}
                </div>
                <div>
                    <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
                        {user.name}
                        {isTop3 && <Award className="w-3.5 h-3.5 text-amber-500" />}
                    </h4>
                    <p className={`text-[10px] font-black uppercase italic tracking-wider ${TIER_COLORS[user.tier || 'Bronze']}`}>
                        {user.tier}
                    </p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-lg font-black text-white">{(user.referralCount || 0) * 5}</p>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tight">{user.referralCount || 0} Successful Referrals</p>
            </div>
        </div>
    );
}
