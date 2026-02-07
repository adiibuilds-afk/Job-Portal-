"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Mail, Send, X, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface EmailSubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function EmailSubscriptionModal({ isOpen, onClose }: EmailSubscriptionModalProps) {
    const [email, setEmail] = useState('');
    const [selectedBatch, setSelectedBatch] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const batches = ['2023', '2024', '2025', '2026', '2027', '2028', '2029'];

    const handleSubscribe = async () => {
        if (!email || !selectedBatch) {
            toast.error('Please enter your email and select your batch');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        setLoading(true);

        try {
            // Subscribe to email alerts
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/subscribe`, {
                email,
                batch: selectedBatch
            });

            toast.success(`🎉 Subscribed! You'll get ${selectedBatch} batch job alerts`, { duration: 4000 });
            setEmail('');
            setSelectedBatch('');
            onClose();
        } catch (error: any) {
            console.error('Subscription error:', error);
            const message = error.response?.data?.message || 'Failed to subscribe. Please try again.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleTelegramClick = () => {
        window.open('https://t.me/jobgridupdates', '_blank');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-8 z-[70] shadow-2xl"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Header */}
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
                                <Mail className="w-8 h-8 text-black" />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-2">Get Job Alerts for Your Batch</h2>
                            <p className="text-zinc-400 text-sm">
                                Subscribe to receive personalized job notifications directly to your inbox
                            </p>
                        </div>

                        {/* Email Input */}
                        <div className="mb-4">
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 block">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your.email@example.com"
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-12 pr-4 py-3.5 text-white outline-none focus:border-amber-500/50 transition-colors placeholder:text-zinc-600"
                                />
                            </div>
                        </div>

                        {/* Batch Selection */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 block flex items-center gap-2">
                                <GraduationCap className="w-4 h-4" /> Graduation Batch
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {batches.map((batch) => (
                                    <button
                                        key={batch}
                                        onClick={() => setSelectedBatch(batch)}
                                        className={`py-3 px-2 rounded-xl text-sm font-bold border transition-all ${selectedBatch === batch
                                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black border-transparent shadow-lg shadow-amber-500/20'
                                            : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-white'
                                            }`}
                                    >
                                        {batch}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={handleSubscribe}
                                disabled={!email || !selectedBatch || loading}
                                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black rounded-xl hover:shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                {loading ? (
                                    'Subscribing...'
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Subscribe to Email Alerts
                                    </>
                                )}
                            </button>

                            {/* Telegram Button */}
                            <button
                                onClick={handleTelegramClick}
                                className="w-full py-3.5 bg-[#0088cc] text-white font-bold rounded-xl hover:bg-[#007ab8] transition-all flex items-center justify-center gap-2 text-sm shadow-lg"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Join Our Telegram Channel
                            </button>
                        </div>

                        {/* Footer Note */}
                        <p className="text-center text-xs text-zinc-600 mt-4">
                            No spam. Unsubscribe anytime. We respect your privacy.
                        </p>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
