import { Sparkles } from 'lucide-react';
import { CoinsData } from './types';
import { PROFILE_REWARDS } from './constants';

interface ProfileRewardsProps {
    data: CoinsData | null;
    onClaim: (type: string) => Promise<void>;
}

export default function ProfileRewards({ data, onClaim }: ProfileRewardsProps) {
    if (!data) return null;

    return (
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
                    const isClaimed = data.profileRewardsClaimed?.includes(reward.id);
                    const isMet = reward.check(data);
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
                                onClick={() => onClaim(reward.id)}
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
    );
}
