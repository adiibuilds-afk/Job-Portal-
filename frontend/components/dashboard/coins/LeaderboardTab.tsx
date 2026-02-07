import { TrendingUp, Flame, Zap } from 'lucide-react';
import { LeaderboardUser } from './types';
import { TIER_COLORS, COIN_EARN_METHODS } from './constants';

interface LeaderboardTabProps {
    leaderboard: LeaderboardUser[];
}

export default function LeaderboardTab({ leaderboard }: LeaderboardTabProps) {
    return (
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
                                <p className="text-sm font-black text-white">{(user.referralCount || 0) * 5}</p>
                                <p className="text-[9px] text-zinc-600 font-bold uppercase">{user.referralCount || 0} refs</p>
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
    );
}
