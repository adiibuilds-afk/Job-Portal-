"use client";

import { useState, useEffect, Suspense, useRef } from 'react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MessageSquare, User, ArrowLeft, Send, Calendar, Eye, Clock, ThumbsUp, Trash2, AtSign } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
        'Interview Experience': 'bg-green-500/10 text-green-400 border-green-500/30',
        'Salary': 'bg-orange-500/10 text-orange-400 border-orange-500/30',
        'Career Advice': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        'Off-Campus': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        'Resume Review': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    };
    return colorMap[category] || 'bg-zinc-800 text-zinc-400 border-zinc-700';
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

export default function SinglePostPage() {
    const params = useParams();
    const id = params?.id;
    const { data: session } = useSession();
    const [post, setPost] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (id) fetchPost();
    }, [id]);

    const fetchPost = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/forum/posts/${id}`);
            setPost(data.post);
            setComments(data.comments);
        } catch (error) {
            console.error('Failed to fetch post', error);
        } finally {
            setLoading(false);
        }
    };

    const handleComment = async () => {
        if (!session) {
            toast.error('Please login to comment', { icon: '🔒' });
            return;
        }
        if (!newComment.trim()) return;
        setSubmitting(true);
        try {
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/forum/posts/${id}/comments`, {
                content: newComment,
                author: session?.user?.name || 'Anonymous',
                authorEmail: session?.user?.email
            });
            setComments([data, ...comments]);
            setNewComment('');
            toast.success('Comment posted!');
        } catch (error: any) {
            console.error('Failed to comment', error);
            const message = error.response?.data?.message || 'Failed to post comment';
            toast.error(message, { icon: error.response?.status === 400 ? '🚫' : '❌' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpvotePost = async () => {
        if (!session?.user?.email) {
            toast.error('Please login to upvote');
            return;
        }
        try {
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/forum/posts/${id}/upvote`, {
                email: session.user.email
            });
            setPost({ ...post, upvotes: data.upvotes });
        } catch (error) {
            console.error('Failed to upvote', error);
        }
    };

    const handleUpvoteComment = async (commentId: string) => {
        if (!session?.user?.email) {
            toast.error('Please login to upvote');
            return;
        }
        try {
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/forum/comments/${commentId}/upvote`, {
                email: session.user.email
            });
            setComments(comments.map(c => c._id === commentId ? { ...c, upvotes: data.upvotes } : c));
        } catch (error) {
            console.error('Failed to upvote comment', error);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('Delete this comment?')) return;
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/forum/comments/${commentId}?email=${session?.user?.email}&name=${session?.user?.name}`);
            setComments(comments.filter(c => c._id !== commentId));
            toast.success('Comment deleted!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        }
    };

    // Check if current user is comment author (email-only check for security)
    const isCommentAuthor = (comment: any) => {
        return session?.user?.email && session.user.email === comment.authorEmail;
    };

    const handleReplyToUser = (username: string) => {
        setNewComment(prev => `@${username} ${prev}`);
        textareaRef.current?.focus();
    };

    // Render comment content with @mentions highlighted
    const renderCommentContent = (content: string) => {
        const parts = content.split(/(@\w+)/g);
        return parts.map((part, i) => {
            if (part.startsWith('@')) {
                return <span key={i} className="text-amber-400 font-bold">{part}</span>;
            }
            return part;
        });
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-zinc-500 font-medium">Loading discussion...</p>
                </div>
            </main>
        );
    }

    if (!post) {
        return (
            <main className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Post not found</h2>
                    <p className="text-zinc-500 mb-6">This discussion may have been deleted.</p>
                    <Link href="/forum" className="px-6 py-3 bg-amber-500 text-black font-bold rounded-xl inline-flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Forum
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[150px]" />
            </div>


            <div className="relative pt-32 pb-20 px-4 max-w-4xl mx-auto">
                {/* Back Link */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Link href="/forum" className="inline-flex items-center gap-2 text-zinc-500 hover:text-amber-400 mb-8 font-medium transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Discussions
                    </Link>
                </motion.div>

                {/* Post Content */}
                <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-3xl p-8 mb-8 relative overflow-hidden"
                >
                    {/* Top Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

                    {/* Author & Meta */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center text-black font-black text-lg shadow-lg shadow-amber-500/20">
                            {post.author?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white text-lg">{post.author}</h3>
                            <div className="flex items-center gap-3 text-xs text-zinc-500">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {getRelativeTime(post.createdAt)}</span>
                                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views} views</span>
                            </div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${getCategoryColor(post.category)}`}>
                            {post.category}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-black mb-6 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                        {post.title}
                    </h1>

                    {/* Content */}
                    <div className="prose prose-invert max-w-none mb-6">
                        <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed text-lg">
                            {post.content}
                        </p>
                    </div>

                    {/* Post Actions */}
                    <div className="flex items-center gap-4 pt-6 border-t border-zinc-800">
                        <button
                            onClick={handleUpvotePost}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-amber-500/10 border border-zinc-700 hover:border-amber-500/30 rounded-xl text-zinc-400 hover:text-amber-400 transition-all font-bold"
                        >
                            <ThumbsUp className="w-4 h-4" />
                            {post.upvotes || 0} Upvotes
                        </button>
                        <span className="flex items-center gap-2 text-zinc-500">
                            <MessageSquare className="w-4 h-4" />
                            {comments.length} Comments
                        </span>
                    </div>
                </motion.article>

                {/* Comments Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-8"
                >
                    <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-800/50 rounded-xl flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-amber-400" />
                        </div>
                        <span>Comments</span>
                    </h3>

                    {/* Add Comment */}
                    <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6 mb-8">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-zinc-800 rounded-xl flex-shrink-0 flex items-center justify-center">
                                {session?.user?.image ? (
                                    <img src={session.user.image} alt="" className="w-full h-full rounded-xl object-cover" />
                                ) : (
                                    <User className="w-5 h-5 text-zinc-500" />
                                )}
                            </div>
                            <div className="flex-1">
                                <textarea
                                    ref={textareaRef}
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add to the discussion... (Use @username to mention someone)"
                                    className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 h-28 mb-3 resize-none placeholder:text-zinc-600 transition-all"
                                />
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-zinc-600 flex items-center gap-1">
                                        <AtSign className="w-3 h-3" />
                                        Tip: Use @username to mention someone
                                    </p>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleComment}
                                        disabled={!newComment.trim() || submitting}
                                        className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:grayscale shadow-lg shadow-amber-500/20 transition-all"
                                    >
                                        {submitting ? (
                                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                        Reply
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Comment List */}
                    <AnimatePresence>
                        <div className="space-y-4">
                            {comments.map((comment, index) => (
                                <motion.div
                                    key={comment._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="flex gap-4"
                                >
                                    <div className="w-10 h-10 bg-zinc-800 rounded-xl flex-shrink-0 flex items-center justify-center mt-1">
                                        <span className="font-bold text-sm text-amber-400">{comment.author?.charAt(0)?.toUpperCase() || 'A'}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-5 hover:border-zinc-700/50 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-white">{comment.author}</span>
                                                    <span className="text-xs text-zinc-600 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {getRelativeTime(comment.createdAt)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {/* Reply button */}
                                                    <button
                                                        onClick={() => handleReplyToUser(comment.author)}
                                                        className="p-1.5 text-zinc-600 hover:text-amber-400 transition-colors"
                                                        title="Reply to this user"
                                                    >
                                                        <AtSign className="w-4 h-4" />
                                                    </button>
                                                    {/* Upvote */}
                                                    <button
                                                        onClick={() => handleUpvoteComment(comment._id)}
                                                        className="flex items-center gap-1 text-zinc-600 hover:text-amber-400 transition-colors"
                                                    >
                                                        <ThumbsUp className="w-4 h-4" />
                                                        <span className="text-xs font-bold">{comment.upvotes || 0}</span>
                                                    </button>
                                                    {/* Delete (only for author) */}
                                                    {isCommentAuthor(comment) && (
                                                        <button
                                                            onClick={() => handleDeleteComment(comment._id)}
                                                            className="p-1.5 text-red-500/50 hover:text-red-400 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-zinc-400 leading-relaxed">{renderCommentContent(comment.content)}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>

                    {comments.length === 0 && (
                        <div className="text-center py-12 bg-zinc-900/30 rounded-2xl border border-zinc-800/50">
                            <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                            <p className="text-zinc-500 font-medium">No comments yet. Be the first to reply!</p>
                        </div>
                    )}
                </motion.div>
            </div>

            <Footer />
        </main>
    );
}
