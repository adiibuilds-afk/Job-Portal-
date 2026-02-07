import { useState } from 'react';
import { Trash2, RefreshCw, Bot, Play, RotateCcw, CheckSquare, Square, Zap, AlertTriangle } from 'lucide-react';
import { QueueItem } from '@/types';
import { toast } from 'react-hot-toast';

interface QueueTableProps {
    queue: QueueItem[];
    pendingCount: number;
    processedCount: number;
    failedCount: number;
    clearQueue: (status?: string) => void;
    runQueueItem: (id: string) => void;
    deleteQueueItem: (id: string) => void;
    onRefresh: () => void;
    apiUrl: string;
}

export default function QueueTable({
    queue, pendingCount, processedCount, failedCount, clearQueue,
    runQueueItem, deleteQueueItem, onRefresh, apiUrl
}: QueueTableProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkLoading, setBulkLoading] = useState(false);

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const selectAll = () => {
        if (selectedIds.size === queue.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(queue.map(q => q._id)));
        }
    };

    const retryJob = async (id: string) => {
        try {
            const res = await fetch(`${apiUrl}/api/admin/queue/${id}/retry`, { method: 'POST' });
            if (!res.ok) throw new Error('Failed to retry');
            toast.success('Job queued for retry');
            onRefresh();
        } catch (err) {
            toast.error('Failed to retry job');
        }
    };

    const retryAllFailed = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/admin/queue/retry-all`, { method: 'POST' });
            const data = await res.json();
            toast.success(data.message);
            onRefresh();
        } catch (err) {
            toast.error('Failed to retry jobs');
        }
    };

    const bulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Delete ${selectedIds.size} selected jobs?`)) return;

        setBulkLoading(true);
        try {
            const res = await fetch(`${apiUrl}/api/admin/queue/bulk-delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedIds) })
            });
            const data = await res.json();
            toast.success(data.message);
            setSelectedIds(new Set());
            onRefresh();
        } catch (err) {
            toast.error('Failed to delete jobs');
        } finally {
            setBulkLoading(false);
        }
    };

    const bulkRun = async () => {
        if (selectedIds.size === 0) return;

        setBulkLoading(true);
        try {
            const res = await fetch(`${apiUrl}/api/admin/queue/bulk-run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedIds) })
            });
            const data = await res.json();
            toast.success(data.message);
            setSelectedIds(new Set());
            onRefresh();
        } catch (err) {
            toast.error('Failed to run jobs');
        } finally {
            setBulkLoading(false);
        }
    };

    const updatePriority = async (id: string, priority: number) => {
        try {
            await fetch(`${apiUrl}/api/admin/queue/${id}/priority`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priority })
            });
            onRefresh();
        } catch (err) {
            toast.error('Failed to update priority');
        }
    };

    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                <div className="flex items-center gap-4">
                    <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Queue Items</span>

                    {/* Bulk Selection Info */}
                    {selectedIds.size > 0 && (
                        <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-lg border border-amber-500/20">
                            {selectedIds.size} selected
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {/* Bulk Actions */}
                    {selectedIds.size > 0 && (
                        <>
                            <button
                                onClick={bulkRun}
                                disabled={bulkLoading}
                                className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 text-[10px] font-black rounded-xl transition-all border border-green-500/20 uppercase tracking-wider flex items-center gap-2"
                            >
                                <Play className="w-3 h-3" /> Run Selected
                            </button>
                            <button
                                onClick={bulkDelete}
                                disabled={bulkLoading}
                                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-black rounded-xl transition-all border border-red-500/20 uppercase tracking-wider flex items-center gap-2"
                            >
                                <Trash2 className="w-3 h-3" /> Delete Selected
                            </button>
                        </>
                    )}

                    {/* Retry All Failed */}
                    {failedCount > 0 && (
                        <button
                            onClick={retryAllFailed}
                            className="px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 text-[10px] font-black rounded-xl transition-all border border-orange-500/20 uppercase tracking-wider flex items-center gap-2"
                        >
                            <RotateCcw className="w-3 h-3" /> Retry Failed ({failedCount})
                        </button>
                    )}

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
                        <th className="px-4 py-5 w-12">
                            <button onClick={selectAll} className="text-zinc-500 hover:text-white transition-colors">
                                {selectedIds.size === queue.length && queue.length > 0
                                    ? <CheckSquare className="w-5 h-5 text-amber-500" />
                                    : <Square className="w-5 h-5" />
                                }
                            </button>
                        </th>
                        <th className="px-4 py-5 text-xs font-black text-zinc-500 uppercase tracking-widest">Target URL</th>
                        <th className="px-4 py-5 text-xs font-black text-zinc-500 uppercase tracking-widest text-center w-20">Priority</th>
                        <th className="px-4 py-5 text-xs font-black text-zinc-500 uppercase tracking-widest text-center">Scheduled</th>
                        <th className="px-4 py-5 text-xs font-black text-zinc-500 uppercase tracking-widest text-center">Status</th>
                        <th className="px-4 py-5 text-xs font-black text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                    {queue.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-20 text-center">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                                        <Bot className="w-8 h-8 text-zinc-700" />
                                    </div>
                                    <p className="text-zinc-600 font-bold">The robot brain is currently idle.</p>
                                    <p className="text-zinc-700 text-sm">Add jobs manually or paste links in Telegram.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                    {queue.map(item => (
                        <tr key={item._id} className={`hover:bg-zinc-900/30 transition-colors group ${selectedIds.has(item._id) ? 'bg-amber-500/5' : ''}`}>
                            {/* Checkbox */}
                            <td className="px-4 py-4">
                                <button onClick={() => toggleSelect(item._id)} className="text-zinc-500 hover:text-white transition-colors">
                                    {selectedIds.has(item._id)
                                        ? <CheckSquare className="w-5 h-5 text-amber-500" />
                                        : <Square className="w-5 h-5" />
                                    }
                                </button>
                            </td>

                            {/* URL & Title */}
                            <td className="px-4 py-4">
                                {(item as any).title && (
                                    <p className="text-white text-sm font-semibold truncate max-w-xs">{(item as any).title}</p>
                                )}
                                <a href={item.originalUrl} target="_blank" rel="noopener noreferrer" className="text-amber-500 text-xs hover:underline truncate max-w-xs block">
                                    {item.originalUrl}
                                </a>
                                {(item as any).source && (
                                    <span className="text-[10px] text-zinc-600 uppercase">{(item as any).source}</span>
                                )}
                            </td>

                            {/* Priority */}
                            <td className="px-4 py-4 text-center">
                                <select
                                    value={(item as any).priority || 0}
                                    onChange={(e) => updatePriority(item._id, parseInt(e.target.value))}
                                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
                                >
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </td>

                            {/* Scheduled */}
                            <td className="px-4 py-4 text-center">
                                <p className="text-white text-sm font-bold">{new Date(item.scheduledFor).toLocaleTimeString()}</p>
                                <p className="text-zinc-600 text-xs">{new Date(item.scheduledFor).toLocaleDateString()}</p>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-4 text-center">
                                <div className="flex flex-col items-center gap-1">
                                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${item.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                        item.status === 'processed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                            'bg-red-500/10 text-red-500 border-red-500/20'
                                        }`}>
                                        {item.status}
                                    </span>
                                    {item.status === 'failed' && (item as any).retryCount > 0 && (
                                        <span className="text-[10px] text-zinc-600">Retry {(item as any).retryCount}/{(item as any).maxRetries || 3}</span>
                                    )}
                                </div>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {item.status === 'pending' && (
                                        <button onClick={() => runQueueItem(item._id)} className="p-2.5 text-zinc-600 hover:text-green-500 hover:bg-green-500/10 rounded-xl transition-all" title="Run Now">
                                            <Play className="w-5 h-5" />
                                        </button>
                                    )}
                                    {item.status === 'failed' && (
                                        <button onClick={() => retryJob(item._id)} className="p-2.5 text-zinc-600 hover:text-orange-500 hover:bg-orange-500/10 rounded-xl transition-all" title="Retry">
                                            <RotateCcw className="w-5 h-5" />
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

            {/* Error details for failed jobs */}
            {queue.some(q => q.status === 'failed' && (q as any).error) && (
                <div className="p-4 border-t border-zinc-800 bg-red-500/5">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-bold text-red-500">Failed Job Errors</span>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {queue.filter(q => q.status === 'failed' && (q as any).error).map(q => (
                            <div key={q._id} className="text-xs text-red-400/80 truncate">
                                <span className="text-zinc-500">{q.originalUrl.substring(0, 30)}...:</span> {(q as any).error}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
