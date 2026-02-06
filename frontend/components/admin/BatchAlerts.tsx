"use client";

import { useState } from 'react';
import axios from 'axios';
import { Bell, Send, Users } from 'lucide-react';

export default function BatchAlerts() {
    const [batch, setBatch] = useState('2025');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    const handleSend = async () => {
        if (!message) return;
        setLoading(true);
        try {
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/alerts/batch`, {
                batch,
                message
            });
            setStatus(`Success! Sent to ${data.count} users from batch ${batch}.`);
            setMessage('');
        } catch (error) {
            console.error(error);
            setStatus('Failed to send alerts.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                Targeted Batch Alerts
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm text-zinc-400 mb-2">Target Batch</label>
                    <div className="flex flex-wrap gap-2">
                        {['2023', '2024', '2025', '2026'].map(b => (
                            <button
                                key={b}
                                onClick={() => setBatch(b)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${batch === b
                                        ? 'bg-amber-500 text-black border-amber-500'
                                        : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500'
                                    }`}
                            >
                                {b}
                            </button>
                        ))}
                    </div>
                    <div className="mt-4 p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                        <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                            <Users className="w-4 h-4" />
                            Estimated Reach
                        </div>
                        <p className="text-2xl font-bold text-white">~ 1,240 Users</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-zinc-400 mb-2">Alert Message</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="e.g. 'New TCS Hiring for 2025 Batch! Apply now...'"
                        className="w-full h-32 bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !message}
                        className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : (
                            <>
                                <Send className="w-4 h-4" />
                                Broadcast Alert
                            </>
                        )}
                    </button>
                    {status && (
                        <p className={`mt-3 text-sm text-center ${status.includes('Success') ? 'text-green-400' : 'text-red-400'}`}>
                            {status}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
