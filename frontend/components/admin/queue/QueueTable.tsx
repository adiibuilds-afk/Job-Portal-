import { Trash2, RefreshCw, Bot, Play } from 'lucide-react';
import { QueueItem } from '@/types';

interface QueueTableProps {
    queue: QueueItem[];
    pendingCount: number;
    processedCount: number;
    clearQueue: (status?: string) => void;
    runQueueItem: (id: string) => void;
    deleteQueueItem: (id: string) => void;
}

export default function QueueTable({
    queue, pendingCount, processedCount, clearQueue,
    runQueueItem, deleteQueueItem
}: QueueTableProps) {
    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Queue Items</span>
                <div className="flex items-center gap-3">
                    {pendingCount > 0 && (
                        <button
                            onClick={() => clearQueue('pending')}
                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-black rounded-xl transition-all border border-red-500/20 uppercase tracking-wider flex items-center gap-2"
                        >
                            <Trash2 className="w-3 h-3" /> Clear Pending
                        </button>
                    )}
                    {processedCount > 0 && (
                        <button
                            onClick={() => clearQueue('processed')}
                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[10px] font-black rounded-xl transition-all border border-zinc-700 uppercase tracking-wider flex items-center gap-2"
                        >
                            <RefreshCw className="w-3 h-3" /> Clear History
                        </button>
                    )}
                </div>
            </div>

            <table className="w-full text-left">
                <thead className="bg-zinc-900/30 border-b border-zinc-800">
                    <tr>
                        <th className="px-6 py-5 text-xs font-black text-zinc-500 uppercase tracking-widest">Target URL</th>
                        <th className="px-6 py-5 text-xs font-black text-zinc-500 uppercase tracking-widest text-center">Scheduled</th>
                        <th className="px-6 py-5 text-xs font-black text-zinc-500 uppercase tracking-widest text-center">Status</th>
                        <th className="px-6 py-5 text-xs font-black text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                    {queue.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-20 text-center">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                                        <Bot className="w-8 h-8 text-zinc-700" />
                                    </div>
                                    <p className="text-zinc-600 font-bold">The robot brain is currently idle.</p>
                                    <p className="text-zinc-700 text-sm">Paste links in Telegram to fill the queue.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                    {queue.map(item => (
                        <tr key={item._id} className="hover:bg-zinc-900/30 transition-colors group">
                            <td className="px-6 py-5">
                                <a href={item.originalUrl} target="_blank" rel="noopener noreferrer" className="text-amber-500 text-sm font-bold hover:underline truncate max-w-xs block">
                                    {item.originalUrl}
                                </a>
                            </td>
                            <td className="px-6 py-5 text-center">
                                <p className="text-white text-sm font-bold">{new Date(item.scheduledFor).toLocaleTimeString()}</p>
                                <p className="text-zinc-600 text-xs">{new Date(item.scheduledFor).toLocaleDateString()}</p>
                            </td>
                            <td className="px-6 py-5 text-center">
                                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${item.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                    item.status === 'processed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                        'bg-red-500/10 text-red-500 border-red-500/20'
                                    }`}>
                                    {item.status}
                                </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {item.status === 'pending' && (
                                        <button onClick={() => runQueueItem(item._id)} className="p-2.5 text-zinc-600 hover:text-green-500 hover:bg-green-500/10 rounded-xl transition-all" title="Run Now">
                                            <Play className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button onClick={() => deleteQueueItem(item._id)} className="p-2.5 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
