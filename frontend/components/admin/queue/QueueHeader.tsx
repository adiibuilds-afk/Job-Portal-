import { Bot, Clock, Settings, CheckCircle2, Trash2 } from 'lucide-react';

interface QueueHeaderProps {
    interval: number;
    editingInterval: boolean;
    setEditingInterval: (val: boolean) => void;
    newInterval: string;
    setNewInterval: (val: string) => void;
    saveInterval: () => void;
    unit: string;
    setUnit: (val: string) => void;
}

export default function QueueHeader({
    interval, editingInterval, setEditingInterval,
    newInterval, setNewInterval, saveInterval, ...props
}: QueueHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/20">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    Bot Automation Queue
                </h2>
                <p className="text-zinc-500 font-medium">Links pending AI processing and Telegram posting.</p>
            </div>
            <div className="flex items-center gap-3">
                {editingInterval ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-amber-500/30 rounded-xl">
                        <input
                            type="number"
                            value={newInterval}
                            onChange={(e) => setNewInterval(e.target.value)}
                            className="w-16 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-center text-white font-black text-sm outline-none focus:border-amber-500"
                            min="1"
                        />
                        <select
                            value={props.unit}
                            onChange={(e) => props.setUnit(e.target.value)}
                            className="bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-zinc-400 text-xs font-bold outline-none focus:border-amber-500"
                        >
                            <option value="minutes">MIN</option>
                            <option value="seconds">SEC</option>
                        </select>

                        <button onClick={saveInterval} className="p-1 text-green-500 hover:bg-green-500/10 rounded">
                            <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingInterval(false)} className="p-1 text-red-500 hover:bg-red-500/10 rounded">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setEditingInterval(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-amber-500/30 transition-all group"
                    >
                        <Clock className="w-4 h-4 text-zinc-500 group-hover:text-amber-500 transition-colors" />
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Interval:</span>
                        <span className="text-amber-500 font-black">{interval} {props.unit === 'seconds' ? 'SEC' : 'MIN'}</span>
                        <Settings className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    </button>
                )}
            </div>
        </div>
    );
}
