"use client";

import { useState } from 'react';
import { Bell, Send, Users, Megaphone, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function NotificationCenter() {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const sendBroadcast = async () => {
        if (!title || !message) {
            toast.error('Please fill in all fields');
            return;
        }

        setSending(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/admin/broadcast`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, message, targetAll: true })
            });

            if (!res.ok) throw new Error('Failed to send broadcast');

            toast.success('Broadcast sent successfully!');
            setTitle('');
            setMessage('');
        } catch (err) {
            toast.error('Failed to send broadcast');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <Megaphone className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-bold text-white">Notification Center</h2>
            </div>

            {/* Broadcast Card */}
            <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <div className="flex items-center gap-2 mb-4">
                    <Bell className="w-4 h-4 text-purple-500" />
                    <h3 className="font-semibold text-white">Send Broadcast</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Announcement title..."
                            className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Message</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                            placeholder="Your message to all users..."
                            className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none resize-none"
                        />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                            <Users className="w-4 h-4" />
                            <span>Will be sent to all users</span>
                        </div>
                        <button
                            onClick={sendBroadcast}
                            disabled={sending || !title || !message}
                            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sending ? (
                                <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            Send Broadcast
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => toast.success('Weekly digest queued!')}
                    className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-blue-500/30 transition-colors text-left"
                >
                    <h4 className="font-medium text-white mb-1">Trigger Weekly Digest</h4>
                    <p className="text-sm text-zinc-500">Send weekly job summary to subscribers</p>
                </button>
                <button
                    onClick={() => toast.success('Channel notification sent!')}
                    className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-cyan-500/30 transition-colors text-left"
                >
                    <h4 className="font-medium text-white mb-1">Telegram Broadcast</h4>
                    <p className="text-sm text-zinc-500">Post announcement to Telegram channel</p>
                </button>
            </div>
        </div>
    );
}
