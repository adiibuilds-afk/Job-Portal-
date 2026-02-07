"use client";

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { X, Send, Sparkles, MessageSquare, TrendingUp, DollarSign, Briefcase, FileText } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    refresh: () => void;
}

const categories = [
    { id: 'Career Advice', label: 'Career Advice', icon: Briefcase, color: 'blue' },
    { id: 'Interview Experience', label: 'Interview Exp', icon: TrendingUp, color: 'green' },
    { id: 'Salary', label: 'Salary Insights', icon: DollarSign, color: 'orange' },
    { id: 'Off-Campus', label: 'Off-Campus', icon: MessageSquare, color: 'purple' },
    { id: 'Resume Review', label: 'Resume Review', icon: FileText, color: 'amber' },
];

const getCategoryStyles = (id: string, isSelected: boolean) => {
    const colorMap: Record<string, { active: string; inactive: string }> = {
        blue: { active: 'bg-blue-500/20 border-blue-500 text-blue-400', inactive: 'border-zinc-700 text-zinc-400 hover:border-blue-500/50' },
        green: { active: 'bg-green-500/20 border-green-500 text-green-400', inactive: 'border-zinc-700 text-zinc-400 hover:border-green-500/50' },
        orange: { active: 'bg-orange-500/20 border-orange-500 text-orange-400', inactive: 'border-zinc-700 text-zinc-400 hover:border-orange-500/50' },
        purple: { active: 'bg-purple-500/20 border-purple-500 text-purple-400', inactive: 'border-zinc-700 text-zinc-400 hover:border-purple-500/50' },
        amber: { active: 'bg-amber-500/20 border-amber-500 text-amber-400', inactive: 'border-zinc-700 text-zinc-400 hover:border-amber-500/50' },
    };
    const cat = categories.find(c => c.id === id);
    const colors = colorMap[cat?.color || 'blue'];
    return isSelected ? colors.active : colors.inactive;
};

export default function CreatePostModal({ isOpen, onClose, refresh }: CreatePostModalProps) {
    const { data: session } = useSession();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('Career Advice');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!session) {
            toast.error('Please login to start a discussion', { icon: '🔒' });
            return;
        }
        if (!title || !content) return;
        setLoading(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/forum/posts`, {
                title,
                content,
                category,
                author: session?.user?.name || 'Anonymous',
                authorEmail: session?.user?.email,
                tags: []
            });
            toast.success('Discussion posted!', { icon: '🎉' });
            refresh();
            onClose();
            setTitle('');
            setContent('');
        } catch (error: any) {
            console.error('Failed to create post', error);
            const message = error.response?.data?.message || 'Failed to post. Please try again.';
            toast.error(message, { icon: error.response?.status === 400 ? '🚫' : '❌' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', duration: 0.5 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/50 rounded-3xl w-full max-w-2xl p-8 shadow-2xl shadow-black/50 relative overflow-hidden"
                    >
                        {/* Glow Effect */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

                        {/* Header */}
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                                    <Sparkles className="w-6 h-6 text-black" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white">Start a Discussion</h2>
                                    <p className="text-sm text-zinc-500">Share your thoughts with the community</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Title Input */}
                            <div>
                                <label className="block text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2 pl-1">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Tips for Amazon SDE Interview?"
                                    className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-white font-medium focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all placeholder:text-zinc-600"
                                />
                            </div>

                            {/* Category Selection */}
                            <div>
                                <label className="block text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2 pl-1">Category</label>
                                <div className="flex gap-2 flex-wrap">
                                    {categories.map((cat, index) => {
                                        const Icon = cat.icon;
                                        return (
                                            <motion.button
                                                key={cat.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.05 }}
                                                onClick={() => setCategory(cat.id)}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all flex items-center gap-2 ${getCategoryStyles(cat.id, category === cat.id)}`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {cat.label}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Content Textarea */}
                            <div>
                                <label className="block text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2 pl-1">Content</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Share your thoughts, questions, or experience..."
                                    className="w-full h-40 bg-black/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all placeholder:text-zinc-600 resize-none"
                                />
                                <p className="text-xs text-zinc-600 mt-1.5 pl-1">{content.length}/2000 characters</p>
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={handleSubmit}
                                disabled={loading || !title || !content}
                                className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        Posting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Post Discussion
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
