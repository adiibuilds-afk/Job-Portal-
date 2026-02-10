import { Send, TrendingUp, Users, Activity, ChevronDown, CheckCircle2, AlertCircle, MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Job } from '@/types';
import { BATCH_OPTIONS } from './types';

interface BroadcastConsoleProps {
    selectedBatches: string[];
    toggleBatch: (val: string) => void;
    counts: Record<string, number>;
    analytics: { openRate: number; ctr: number };
    totalReach: number;
    jobs: Job[];
    selectedJobId: string;
    onJobSelect: (id: string) => void;
    subject: string;
    setSubject: (val: string) => void;
    message: string;
    setMessage: (val: string) => void;
    loading: boolean;
    status: string;
    onSend: () => void;
}

export default function BroadcastConsole(props: BroadcastConsoleProps) {
    const {
        selectedBatches, toggleBatch, counts, analytics, totalReach,
        jobs, selectedJobId, onJobSelect, subject, setSubject,
        message, setMessage, loading, status, onSend
    } = props;

    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                    <Send className="w-6 h-6 text-blue-500" />
                    Broadcast Console
                </h2>
                <div className="flex w-full md:w-auto gap-4 md:gap-6">
                    <div className="flex-1 md:flex-none text-center px-4 md:px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl">
                        <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-2">Open Rate</div>
                        <div className="text-xl md:text-2xl font-black text-green-500 leading-none flex items-center justify-center gap-1">
                            <TrendingUp className="w-4 h-4" /> {analytics.openRate}%
                        </div>
                    </div>
                    <div className="flex-1 md:flex-none text-center px-4 md:px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl">
                        <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-2">CTR</div>
                        <div className="text-xl md:text-2xl font-black text-blue-500 leading-none">{analytics.ctr}%</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <div>
                        <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Target Batches</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {BATCH_OPTIONS.map(b => (
                                <button
                                    key={b.value}
                                    onClick={() => toggleBatch(b.value)}
                                    className={`px-3 py-3 rounded-2xl text-xs font-black border transition-all ${selectedBatches.includes(b.value)
                                        ? 'bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20'
                                        : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700'
                                        }`}
                                >
                                    {b.label}
                                    <div className="text-[10px] opacity-60 mt-1">{counts[b.value] || 0} Users</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 bg-zinc-900 rounded-3xl border border-zinc-800 flex justify-between items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Users className="w-16 h-16" />
                        </div>
                        <div className="relative z-10">
                            <div className="text-zinc-500 text-sm font-bold flex items-center gap-2 mb-1">
                                <Activity className="w-4 h-4 text-amber-500" /> Estimated Reach
                            </div>
                            <p className="text-3xl font-black text-white tracking-tight">
                                {totalReach.toLocaleString()} <span className="text-sm text-zinc-600 font-bold uppercase tracking-widest">Active Members</span>
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Or Select Specific Job</label>
                        <div className="relative">
                            <select
                                value={selectedJobId}
                                onChange={(e) => onJobSelect(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white appearance-none focus:border-amber-500 transition-all font-bold"
                            >
                                <option value="">Select a job to auto-fill...</option>
                                {jobs.map(job => (
                                    <option key={job._id} value={job._id}>
                                        {job.company} — {job.title}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8 flex flex-col items-stretch">
                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Compose Broadcast</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Email Subject Line..."
                        className="w-full mb-4 bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-amber-500 transition-all font-bold"
                    />
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Message body (supports plain text or markdown)..."
                        className="w-full flex-1 min-h-[200px] bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-amber-500 transition-all font-mono mb-6"
                    />
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button
                            onClick={() => {
                                const formatted = `🔥 *New Opportunity: ${subject}*\n\n${message}\n\nApply here: https://jobgrid.in/jobs`;
                                navigator.clipboard.writeText(formatted);
                                toast.success('Formatted for WhatsApp!');
                            }}
                            className="py-3 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp
                        </button>
                        <button
                            onClick={() => {
                                const formatted = `📢 **${subject}**\n\n${message}\n\n🔗 Apply: https://jobgrid.in/jobs`;
                                navigator.clipboard.writeText(formatted);
                                toast.success('Formatted for Telegram!');
                            }}
                            className="py-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <Send className="w-4 h-4" />
                            Telegram
                        </button>
                    </div>

                    <button
                        onClick={onSend}
                        disabled={loading || !message || !subject || selectedBatches.length === 0}
                        className={`w-full py-5 font-black rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl ${(loading || !message || !subject || selectedBatches.length === 0)
                            ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black hover:scale-[1.02] shadow-amber-500/20 active:scale-[0.98]'
                            }`}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Launch Broadcast to {totalReach.toLocaleString()} Users
                            </>
                        )}
                    </button>
                    {status && (
                        <p className={`mt-4 text-sm text-center font-bold flex items-center justify-center gap-2 ${status.includes('Success') ? 'text-green-500' : 'text-red-400'}`}>
                            {status.includes('Success') ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            {status}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
