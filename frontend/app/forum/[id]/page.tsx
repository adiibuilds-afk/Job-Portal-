"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MessageSquare, User, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function SinglePostPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const { data: session } = useSession();
    const [post, setPost] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPost();
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
        if (!newComment.trim()) return;
        try {
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/forum/posts/${id}/comments`, {
                content: newComment,
                author: session?.user?.name || 'Anonymous'
            });
            setComments([data, ...comments]);
            setNewComment('');
        } catch (error) {
            console.error('Failed to comment', error);
        }
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
    if (!post) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Post not found</div>;

    return (
        <main className="min-h-screen bg-black text-white">
            <Navbar />

            <div className="pt-28 pb-20 px-4 max-w-4xl mx-auto">
                <Link href="/forum" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to Discussions
                </Link>

                {/* Post Content */}
                <article className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 font-bold">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">{post.author}</h3>
                            <p className="text-xs text-zinc-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className="ml-auto px-3 py-1 rounded-full bg-zinc-800 text-xs font-bold text-zinc-400">
                            {post.category}
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
                    <div className="prose prose-invert max-w-none text-zinc-300">
                        <p className="whitespace-pre-wrap leading-relaxed">{post.content}</p>
                    </div>
                </article>

                {/* Comments Section */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" /> {comments.length} Comments
                    </h3>

                    {/* Add Comment */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-8 flex gap-4">
                        <div className="w-10 h-10 bg-zinc-800 rounded-full flex-shrink-0 flex items-center justify-center">
                            <User className="w-5 h-5 text-zinc-500" />
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add to the discussion..."
                                className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 h-24 mb-2"
                            />
                            <button
                                onClick={handleComment}
                                disabled={!newComment.trim()}
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg flex items-center gap-2 disabled:opacity-50 ml-auto"
                            >
                                <Send className="w-4 h-4" /> Reply
                            </button>
                        </div>
                    </div>

                    {/* Comment List */}
                    <div className="space-y-6">
                        {comments.map(comment => (
                            <div key={comment._id} className="flex gap-4">
                                <div className="w-8 h-8 bg-zinc-800 rounded-full flex-shrink-0 flex items-center justify-center mt-1">
                                    <span className="font-bold text-xs text-zinc-500">{comment.author[0]}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-zinc-300 text-sm">{comment.author}</span>
                                            <span className="text-xs text-zinc-600">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-zinc-400 text-sm leading-relaxed">{comment.content}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
