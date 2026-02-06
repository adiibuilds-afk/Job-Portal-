import { Play, Trash2 } from 'lucide-react';
import { QueueItem } from '@/types';

interface QueueTabProps {
    queue: QueueItem[];
    runQueueItem: (id: string) => void;
    deleteQueueItem: (id: string) => void;
    clearQueue: (status?: string) => void;
}

export default function QueueTab({ queue, runQueueItem, deleteQueueItem, clearQueue }: QueueTabProps) {
    const pendingCount = queue.filter(q => q.status === 'pending').length;
    const processedCount = queue.filter(q => q.status === 'processed').length;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-zinc-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-white">Bot Automation Queue</h2>
                        <p className="text-zinc-500">Links pending AI processing and channel posting</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {pendingCount > 0 && (
                            <button
                                onClick={() => clearQueue('pending')}
                                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-black rounded-lg transition-all border border-red-500/20 uppercase tracking-wider"
                            >
                                Clear Queue
                            </button>
                        )}
                        {processedCount > 0 && (
                            <button
                                onClick={() => clearQueue('processed')}
                                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[10px] font-black rounded-lg transition-all border border-zinc-700 uppercase tracking-wider"
                            >
                                Clear History
                            </button>
                        )}
                        <div className="text-right ml-4">
                            <p className="text-xs text-zinc-600 tracking-widest uppercase mb-1">Interval</p>
                            <span className="text-amber-500 font-black">5 MINUTES</span>
                        </div>
                    </div>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-zinc-800/50">
                        <tr>
                            <th className="px-8 py-4 text-xs font-black text-zinc-400 uppercase">Target URL</th>
                            <th className="px-8 py-4 text-xs font-black text-zinc-400 uppercase">Scheduled For</th>
                            <th className="px-8 py-4 text-xs font-black text-zinc-400 uppercase">Status</th>
                            <th className="px-8 py-4 text-xs font-black text-zinc-400 text-right uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {queue.map(item => (
                            <tr key={item._id} className="hover:bg-zinc-800/30 transition-colors">
                                <td className="px-8 py-5">
                                    <a href={item.originalUrl} target="_blank" rel="noopener noreferrer" className="text-amber-500 text-sm font-medium hover:underline truncate max-w-xs block">
                                        {item.originalUrl}
                                    </a>
                                </td>
                                <td className="px-8 py-5">
                                    <p className="text-white text-sm font-bold">{new Date(item.scheduledFor).toLocaleTimeString()}</p>
                                    <p className="text-zinc-500 text-xs">{new Date(item.scheduledFor).toLocaleDateString()}</p>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${item.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                                        item.status === 'processed' ? 'bg-green-500/10 text-green-500' :
                                            'bg-red-500/10 text-red-500'
                                        }`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right flex items-center justify-end gap-2">
                                    {item.status === 'pending' && (
                                        <button onClick={() => runQueueItem(item._id)} className="p-2 text-zinc-600 hover:text-green-500" title="Run Now"><Play className="w-5 h-5" /></button>
                                    )}
                                    <button onClick={() => deleteQueueItem(item._id)} className="p-2 text-zinc-600 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                                </td>
                            </tr>
                        ))}
                        {queue.length === 0 && (
                            <tr><td colSpan={4} className="p-20 text-center text-zinc-600">The robot brain is currently idle. Paste links in Telegram to fill the queue.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
