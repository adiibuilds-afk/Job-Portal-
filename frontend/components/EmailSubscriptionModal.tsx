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
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 z-[70] shadow-2xl"
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

                            {/* WhatsApp Group Button */}
                            <button
                                onClick={() => window.open('https://chat.whatsapp.com/EuNhXQkwy7Y4ELMjB1oVPd?mode=gi_t', '_blank')}
                                className="w-full py-3.5 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#1ebe57] transition-all flex items-center justify-center gap-2 text-sm shadow-lg"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                                </svg>
                                Join Our WhatsApp Group
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
