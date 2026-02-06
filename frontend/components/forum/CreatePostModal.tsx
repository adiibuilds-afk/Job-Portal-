"use client";

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { X, Send } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    refresh: () => void;
}

export default function CreatePostModal({ isOpen, onClose, refresh }: CreatePostModalProps) {
    const { data: session } = useSession();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('Career Advice');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title || !content) return;
        setLoading(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/forum/posts`, {
                title,
                content,
                category,
                author: session?.user?.name || 'Anonymous',
                tags: []
            });
            refresh();
            onClose();
            setTitle('');
            setContent('');
        } catch (error) {
            console.error('Failed to create post', error);
            toast.error('Failed to post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Start a Discussion</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white"><X className="w-6 h-6" /></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Tips for Amazon SDE Interview?"
                            className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">Category</label>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {['Career Advice', 'Interview Experience', 'Salary', 'Off-Campus', 'Resume Review'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`px-3 py-1.5 rounded-lg text-sm border ${category === cat
                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">Content</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Share your thoughts, questions, or experience..."
                            className="w-full h-40 bg-black border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading || !title || !content}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Posting...' : <><Send className="w-4 h-4" /> Post Discussion</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
