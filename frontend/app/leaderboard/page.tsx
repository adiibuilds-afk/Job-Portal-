import { TrendingUp, Flame, Zap, Share2, Award, Trophy, ArrowRight, Linkedin, MessageCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LeaderboardUser } from '@/components/dashboard/coins/types';
import LeaderboardCard from '@/components/leaderboard/LeaderboardCard';
import ShareMilestoneButton from '@/components/leaderboard/ShareMilestoneButton';
import CopyReferralLink from '@/components/leaderboard/CopyReferralLink';

async function getLeaderboardData(): Promise<LeaderboardUser[]> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jobgrid-in.onrender.com'}/api/user/coins/leaderboard`, { next: { revalidate: 3600 } });
        const data = await res.json();
        return data.leaderboard || [];
    } catch (error) {
        console.error('Failed to fetch leaderboard', error);
        return [];
    }
}

export default async function LeaderboardPage() {
    const leaderboard = await getLeaderboardData();

    return (
        <main className="min-h-screen bg-black relative overflow-hidden">
            <Navbar />

            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[200px] pointer-events-none" />
            <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="relative pt-32 pb-20 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16 space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-black uppercase tracking-widest mb-4">
                            <Trophy className="w-3.5 h-3.5" />
                            Global Rankings
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
                            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">Leaderboard</span>
                        </h1>
                        <p className="text-zinc-500 text-lg max-w-xl mx-auto font-medium">
                            The top-performing freshers on JobGrid. Refer friends, earn coins, and climb the tiers to unlock exclusive rewards.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                        {/* Main Leaderboard */}
                        <div className="md:col-span-8 space-y-6">
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
                                <div className="p-6 bg-zinc-800/30 border-b border-zinc-800 flex justify-between text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                                    <span>Rank & User</span>
                                    <span>Points</span>
                                </div>
                                <div className="divide-y divide-zinc-800/50">
                                    {leaderboard.map((user, idx) => (
                                        <LeaderboardCard key={user._id} user={user} rank={idx + 1} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="md:col-span-4 space-y-6">
                            <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] text-white overflow-hidden relative group">
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-black mb-2">Want to be here?</h3>
                                    <p className="text-blue-100 text-sm mb-6 font-medium leading-relaxed">
                                        Refer your batchmates and earn 5 coins for every signup. Top users get featured here!
                                    </p>
                                    <ShareMilestoneButton />
                                    <CopyReferralLink />
                                </div>
                                <Award className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                            </div>

                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-8 backdrop-blur-sm">
                                <h3 className="text-white font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Flame className="w-4 h-4 text-orange-500" />
                                    Tier Milestones
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { tier: 'Bronze', req: '0 Refs', color: 'text-zinc-500' },
                                        { tier: 'Silver', req: '3 Refs', color: 'text-zinc-300' },
                                        { tier: 'Gold', req: '10 Refs', color: 'text-amber-400' },
                                        { tier: 'Diamond', req: '25 Refs', color: 'text-blue-400' }
                                    ].map((m) => (
                                        <div key={m.tier} className="flex items-center justify-between group">
                                            <span className={`text-sm font-bold ${m.color}`}>{m.tier}</span>
                                            <span className="text-[10px] font-black text-zinc-600 group-hover:text-zinc-400 transition-colors">{m.req}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
