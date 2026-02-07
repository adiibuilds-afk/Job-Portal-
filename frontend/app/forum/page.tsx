"use client";

import { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MessageSquare, Eye, Plus, TrendingUp, Users, Flame, Sparkles, Search, ThumbsUp, Clock, Trash2, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import CreatePostModal from '@/components/forum/CreatePostModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

const categories = [
    { id: 'all', label: 'All Topics', icon: Sparkles, color: 'amber' },
    { id: 'mine', label: 'My Discussions', icon: Users, color: 'cyan' },
    { id: 'Interview Experience', label: 'Interview Exp', icon: TrendingUp, color: 'green' },
    { id: 'Salary', label: 'Salary Insights', icon: Flame, color: 'orange' },
    { id: 'Career Advice', label: 'Career Advice', icon: Users, color: 'blue' },
    { id: 'Off-Campus', label: 'Off-Campus', icon: MessageSquare, color: 'purple' },
];

const sortOptions = [
    { id: 'newest', label: 'Newest' },
    { id: 'popular', label: 'Most Upvoted' },
    { id: 'views', label: 'Most Viewed' },
    { id: 'comments', label: 'Most Discussed' },
];

const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    const colorMap: Record<string, string> = {
        amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
        green: 'bg-green-500/10 text-green-400 border-green-500/30',
        orange: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    };
    return colorMap[cat?.color || 'amber'] || colorMap.amber;
};

// Relative time helper
const getRelativeTime = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString();
};

export default function ForumPage() {
    const { data: session } = useSession();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSortMenu, setShowSortMenu] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, [filter, sortBy]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            // For 'mine', we'll filter client-side after fetching all
            if (filter !== 'all' && filter !== 'mine') params.append('category', filter);
            if (sortBy) params.append('sort', sortBy);
            if (searchQuery) params.append('search', searchQuery);

            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/forum/posts?${params.toString()}`);

            // Filter for user's own posts
            if (filter === 'mine' && session?.user) {
                const myPosts = data.filter((p: any) =>
                    p.authorEmail === session.user?.email || p.author === session.user?.name
                );
                setPosts(myPosts);
            } else {
                setPosts(data);
            }
        } catch (error) {
            console.error('Failed to fetch posts', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchPosts();
    };

    const handleUpvote = async (postId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!session?.user?.email) {
            toast.error('Please login to upvote');
            return;
        }
        try {
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/forum/posts/${postId}/upvote`, {
                email: session.user.email
            });
            setPosts(posts.map(p => p._id === postId ? { ...p, upvotes: data.upvotes } : p));
        } catch (error) {
            console.error('Failed to upvote', error);
        }
    };

    const handleDelete = async (postId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this post?')) return;
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/forum/posts/${postId}?email=${session?.user?.email}&name=${session?.user?.name}`);
            setPosts(posts.filter(p => p._id !== postId));
            toast.success('Post deleted!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        }
    };

    // Check if current user is post author
    const isPostAuthor = (post: any) => {
        return session?.user?.email === post.authorEmail || session?.user?.name === post.author;
    };

    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[150px]" />
            </div>

            <Suspense fallback={null}>
                <Navbar />
            </Suspense>

            <div className="relative pt-24 md:pt-28 pb-20 px-4 max-w-6xl mx-auto">
                {/* Hero Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-bold mb-6">
                        <MessageSquare className="w-4 h-4" />
                        Community Forum
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                        Career Discussions
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-xl mx-auto">
                        Ask questions, share interview experiences, and connect with fellow job seekers.
                    </p>
                </motion.div>

                {/* Search Bar */}
                <motion.form
                    onSubmit={handleSearch}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.05 }}
                    className="mb-6"
                >
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search discussions..."
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all placeholder:text-zinc-600"
                        />
                        {searchQuery && (
                            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-amber-500 text-black font-bold rounded-lg text-sm">
                                Search
                            </button>
                        )}
                    </div>
                </motion.form>

                {/* Action Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8"
                >
                    {/* Category Filters */}
                    <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center md:justify-start">
                        {categories.map((cat, index) => {
                            const Icon = cat.icon;
                            return (
                                <motion.button
                                    key={cat.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    onClick={() => setFilter(cat.id)}
                                    className={`px-3 py-2 rounded-lg text-xs md:text-sm font-bold border transition-all flex items-center gap-1.5 ${filter === cat.id
                                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-lg shadow-amber-500/10'
                                        : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                                        }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {cat.label}
                                </motion.button>
                            );
                        })}
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        {/* Sort Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSortMenu(!showSortMenu)}
                                className="px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-400 flex items-center gap-2 hover:border-zinc-700 transition-all"
                            >
                                <ArrowUpDown className="w-4 h-4" />
                                {sortOptions.find(s => s.id === sortBy)?.label}
                            </button>
                            {showSortMenu && (
                                <div className="absolute top-full mt-2 right-0 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl z-10 min-w-[160px]">
                                    {sortOptions.map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => { setSortBy(opt.id); setShowSortMenu(false); }}
                                            className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors ${sortBy === opt.id ? 'bg-amber-500/10 text-amber-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Create Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsModalOpen(true)}
                            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
                        >
                            <Plus className="w-5 h-5" />
                            Start Discussion
                        </motion.button>
                    </div>
                </motion.div>

                {/* Posts Grid */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-20"
                        >
                            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-zinc-500 font-medium">Loading discussions...</p>
                        </motion.div>
                    ) : posts.length > 0 ? (
                        <motion.div
                            key="posts"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid gap-4"
                        >
                            {posts.map((post, index) => (
                                <motion.div
                                    key={post._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                >
                                    <Link
                                        href={`/forum/${post._id}`}
                                        className="block bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6 hover:border-amber-500/30 hover:bg-zinc-900/60 transition-all group relative overflow-hidden"
                                    >
                                        {/* Hover Glow */}
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                                        </div>

                                        <div className="relative">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-black border ${getCategoryColor(post.category)}`}>
                                                            {post.category}
                                                        </span>
                                                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {getRelativeTime(post.createdAt)}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors mb-2">
                                                        {post.title}
                                                    </h3>
                                                    <p className="text-zinc-400 text-sm line-clamp-2 mb-4 leading-relaxed">
                                                        {post.content}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-sm flex-wrap">
                                                        {/* Upvote Button */}
                                                        <button
                                                            onClick={(e) => handleUpvote(post._id, e)}
                                                            className="flex items-center gap-1.5 text-zinc-500 hover:text-amber-400 transition-colors"
                                                        >
                                                            <ThumbsUp className="w-4 h-4" />
                                                            <span className="font-bold">{post.upvotes || 0}</span>
                                                        </button>
                                                        <span className="flex items-center gap-1.5 text-zinc-500">
                                                            <MessageSquare className="w-4 h-4" />
                                                            <span className="font-bold">{post.commentCount || 0}</span>
                                                        </span>
                                                        <span className="flex items-center gap-1.5 text-zinc-500">
                                                            <Eye className="w-4 h-4" />
                                                            <span className="font-bold">{post.views || 0}</span>
                                                        </span>
                                                        <span className="text-zinc-600 font-medium">by <span className="text-zinc-400">{post.author}</span></span>

                                                        {/* Delete Button (only for author) */}
                                                        {isPostAuthor(post) && (
                                                            <button
                                                                onClick={(e) => handleDelete(post._id, e)}
                                                                className="flex items-center gap-1 text-red-500/50 hover:text-red-400 transition-colors ml-auto"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-20 bg-zinc-900/30 backdrop-blur-sm rounded-3xl border border-zinc-800/50"
                        >
                            <div className="w-20 h-20 bg-zinc-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <MessageSquare className="w-10 h-10 text-zinc-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">No discussions yet</h3>
                            <p className="text-zinc-500 mb-6">Be the first to start a conversation!</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-6 py-3 bg-amber-500 text-black font-bold rounded-xl inline-flex items-center gap-2 hover:bg-amber-400 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Start Discussion
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} refresh={fetchPosts} />
            <Footer />
        </main>
    );
}
