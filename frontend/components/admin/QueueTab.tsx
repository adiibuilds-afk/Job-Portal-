"use client";

import { useState, useEffect } from 'react';
import { Play, Trash2, Clock, Link2, CheckCircle2, Bot, RefreshCw, Settings } from 'lucide-react';
import { QueueItem } from '@/types';

interface QueueTabProps {
    queue: QueueItem[];
    runQueueItem: (id: string) => void;
    deleteQueueItem: (id: string) => void;
    clearQueue: (status?: string) => void;
}

export default function QueueTab({ queue, runQueueItem, deleteQueueItem, clearQueue }: QueueTabProps) {
    const [interval, setInterval] = useState(5);
    const [editingInterval, setEditingInterval] = useState(false);
    const [newInterval, setNewInterval] = useState('5');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jobgrid-in.onrender.com';

    const pendingCount = queue.filter(q => q.status === 'pending').length;
    const processedCount = queue.filter(q => q.status === 'processed').length;

    useEffect(() => {
        fetchInterval();
    }, []);

    const fetchInterval = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/queue-interval`);
            const data = await res.json();
            setInterval(data.interval || 5);
            setNewInterval(String(data.interval || 5));
        } catch (error) {
            console.error('Failed to fetch queue interval');
        }
    };

    const saveInterval = async () => {
        try {
            await fetch(`${API_URL}/api/admin/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'queue_interval_minutes', value: parseInt(newInterval) || 5 })
            });
            setInterval(parseInt(newInterval) || 5);
            setEditingInterval(false);
        } catch (error) {
            console.error('Failed to save interval');
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
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
                            <span className="text-zinc-500 text-xs font-bold">MIN</span>
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
                            <span className="text-amber-500 font-black">{interval} MIN</span>
                            <Settings className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl">
                    <div className="p-3 rounded-2xl bg-zinc-800 border border-zinc-700 w-fit mb-4 text-amber-500">
                        <Clock className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">Pending</p>
                    <h3 className="text-3xl font-black text-white">{pendingCount}</h3>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl">
                    <div className="p-3 rounded-2xl bg-zinc-800 border border-zinc-700 w-fit mb-4 text-green-500">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">Processed</p>
                    <h3 className="text-3xl font-black text-white">{processedCount}</h3>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl">
                    <div className="p-3 rounded-2xl bg-zinc-800 border border-zinc-700 w-fit mb-4 text-blue-500">
                        <Link2 className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">Total Links</p>
                    <h3 className="text-3xl font-black text-white">{queue.length}</h3>
                </div>
            </div>

            {/* Table */}
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
        </div>
    );
}
