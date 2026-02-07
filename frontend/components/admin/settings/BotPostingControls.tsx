import { Bot, ToggleRight } from 'lucide-react';

interface BotPostingControlsProps {
    postingQueuePaused: boolean;
    onToggle: () => void;
    interval: number;
    onIntervalChange: (val: number) => void;
}

export default function BotPostingControls({
    postingQueuePaused, onToggle, interval, onIntervalChange
}: BotPostingControlsProps) {
    return (
        <div className={`bg-zinc-950 border rounded-[2.5rem] p-8 transition-all ${postingQueuePaused
            ? 'border-red-500/30'
            : 'border-blue-500/30'
            }`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${postingQueuePaused ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
                        <Bot className={`w-7 h-7 ${postingQueuePaused ? 'text-red-500' : 'text-blue-500'}`} />
                    </div>
                    <div>
                        <div className="flex items-center gap-4 mb-1">
                            <h3 className="font-bold text-xl text-white">Telegram Auto-Posting</h3>
                            <button onClick={onToggle} className="transition-transform hover:scale-110">
                                <ToggleRight className={`w-10 h-10 ${postingQueuePaused ? 'text-red-500' : 'text-blue-500'}`} />
                            </button>
                        </div>
                        <p className="text-sm text-zinc-500 font-medium">
                            {postingQueuePaused
                                ? "Posting is PAUSED. Scheduled jobs will not be sent."
                                : "Posting is ACTIVE. The bot is sending jobs to Telegram."}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
                    <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Post Interval</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={interval}
                                onChange={(e) => onIntervalChange(parseInt(e.target.value) || 60)}
                                className="bg-zinc-950 border border-zinc-700 text-white font-mono text-xl font-bold rounded-xl w-20 px-3 py-2 focus:border-blue-500 outline-none text-center"
                                min="1"
                            />
                            <span className="text-zinc-500 text-sm font-bold">mins</span>
                        </div>
                    </div>
                    <div className="text-xs text-zinc-600 max-w-[140px] font-medium">
                        Time gap between consecutive posts when new jobs are scraped.
                    </div>
                </div>
            </div>
        </div>
    );
}
