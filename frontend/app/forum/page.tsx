"use client";

import { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MessageSquare, ThumbsUp, Eye, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import CreatePostModal from '@/components/forum/CreatePostModal';

export default function ForumPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchPosts();
    }, [filter]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/forum/posts?category=${filter}`);
            setPosts(data);
        } catch (error) {
            console.error('Failed to fetch posts', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-black text-white">
            <Suspense fallback={null}>
                <Navbar />
            </Suspense>

            <div className="pt-28 pb-20 px-4 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Career Discussions</h1>
                        <p className="text-zinc-400">Ask questions, share interview experiences, and connect with peers.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <Plus className="w-5 h-5" /> Start Discussion
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
                    {['all', 'Interview Experience', 'Salary', 'Career Advice', 'Off-Campus'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all ${filter === cat
                                ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                }`}
                        >
                            {cat === 'all' ? 'All Topics' : cat}
                        </button>
                    ))}
                </div>

                {/* Posts Grid */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-zinc-500">Loading discussions...</p>
                    </div>
                ) : posts.length > 0 ? (
                    <div className="space-y-4">
                        {posts.map(post => (
                            <Link
                                href={`/forum/${post._id}`}
                                key={post._id}
                                className="block bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-indigo-500/30 hover:bg-zinc-900 transition-all group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-zinc-800 text-zinc-400">
                                                {post.category}
                                            </span>
                                            <span className="text-xs text-zinc-500">• {new Date(post.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors mb-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-zinc-400 text-sm line-clamp-2 mb-4">
                                            {post.content}
                                        </p>
                                        <div className="flex items-center gap-6 text-sm text-zinc-500">
                                            <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /> {post.commentCount || 0} Comments</span>
                                            <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {post.views || 0} Views</span>
                                            <span className="text-zinc-600">by {post.author}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                        <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No discussions yet</h3>
                        <p className="text-zinc-500">Be the first to start a conversation!</p>
                    </div>
                )}
            </div>

            <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} refresh={fetchPosts} />
            <Footer />
        </main>
    );
}
