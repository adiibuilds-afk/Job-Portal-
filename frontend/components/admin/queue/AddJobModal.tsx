"use client";

import { useState, useEffect } from 'react';
import { Plus, Link, Clock, Zap, X, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AddJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: () => void;
    apiUrl: string;
}

export default function AddJobModal({ isOpen, onClose, onAdd, apiUrl }: AddJobModalProps) {
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState(0);
    const [scheduleLater, setScheduleLater] = useState(false);
    const [scheduledTime, setScheduledTime] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) {
            toast.error('URL is required');
            return;
        }

        setSubmitting(true);
        try {
            const body: any = { url, title, priority };
            if (scheduleLater && scheduledTime) {
                body.scheduledFor = new Date(scheduledTime).toISOString();
            }

            const res = await fetch(`${apiUrl}/api/admin/queue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error('Failed to add job');

            toast.success('Job added to queue!');
            setUrl('');
            setTitle('');
            setPriority(0);
            setScheduleLater(false);
            setScheduledTime('');
            onAdd();
            onClose();
        } catch (err) {
            toast.error('Failed to add job');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
                {/* Header */}
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Plus className="w-5 h-5 text-amber-500" />
                        <h2 className="text-lg font-bold text-white">Add to Queue</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-800 transition-colors">
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* URL */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Job URL *</label>
                        <div className="relative">
                            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="url"
                                required
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://careers.example.com/job/..."
                                className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Title (optional)</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Software Engineer at Google"
                            className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                        />
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-2">
                            <Zap className="w-4 h-4 text-amber-500" />
                            Priority: {priority}
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            value={priority}
                            onChange={(e) => setPriority(parseInt(e.target.value))}
                            className="w-full accent-amber-500"
                        />
                        <div className="flex justify-between text-xs text-zinc-600 mt-1">
                            <span>Normal</span>
                            <span>High</span>
                        </div>
                    </div>

                    {/* Schedule Later */}
                    <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={scheduleLater}
                                onChange={(e) => setScheduleLater(e.target.checked)}
                                className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-amber-500 focus:ring-amber-500"
                            />
                            <Clock className="w-4 h-4 text-zinc-500" />
                            <span className="text-sm text-zinc-400">Schedule for later</span>
                        </label>

                        {scheduleLater && (
                            <input
                                type="datetime-local"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                                className="mt-3 w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                            />
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting || !url}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors disabled:opacity-50"
                    >
                        {submitting ? (
                            <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                            <Plus className="w-4 h-4" />
                        )}
                        Add to Queue
                    </button>
                </form>
            </div>
        </div>
    );
}
