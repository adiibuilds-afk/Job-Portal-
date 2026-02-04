"use client";

import { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';

export default function EmailSubscription() {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            // TODO: Connect to actual email service
            setSubscribed(true);
            setEmail('');
        }
    };

    if (subscribed) {
        return (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center">
                <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">Subscribed!</h3>
                <p className="text-zinc-500 text-sm">You&apos;ll receive job alerts in your inbox.</p>
            </div>
        );
    }

    return (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                    <h3 className="font-bold text-white">Email Alerts</h3>
                    <p className="text-xs text-zinc-500">Get jobs in your inbox</p>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder:text-zinc-600 outline-none focus:border-amber-500/50 transition-colors"
                    required
                />
                <button
                    type="submit"
                    className="px-4 py-2.5 bg-amber-500 text-black font-bold rounded-xl text-sm hover:bg-amber-400 transition-colors"
                >
                    Subscribe
                </button>
            </form>
        </div>
    );
}
