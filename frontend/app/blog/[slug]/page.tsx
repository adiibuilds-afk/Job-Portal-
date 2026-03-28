"use client";

import { Metadata } from 'next';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { blogPosts } from '@/data/blogPosts';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
    ArrowLeft, Calendar, Clock, User, Share2, 
    Facebook, Twitter, Linkedin, Bookmark, 
    MessageSquare, Copy, Check, Sparkles,
    Briefcase,
    ChevronRight,
    TrendingUp
} from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

export default function BlogPostPage() {
    const params = useParams();
    const slug = params.slug as string;
    const post = blogPosts.find(p => p.slug === slug);
    const [copied, setCopied] = useState(false);
    
    // Scroll Progress
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    if (!post) {
        notFound();
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <main className="min-h-screen bg-black relative selection:bg-amber-500/30">
            
            {/* Reading Progress Bar */}
            <motion.div 
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 z-[100] origin-left"
                style={{ scaleX }}
            />

            {/* Premium Background Elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[200px]" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-zinc-900/40 rounded-full blur-[150px]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10" />
            </div>

            <div className="relative z-10">
                {/* Header / Hero Section */}
                <div className="relative pt-32 pb-16 px-6 overflow-hidden">
                    <div className="max-w-4xl mx-auto">
                        
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Link 
                                href="/blog" 
                                className="inline-flex items-center gap-2 text-zinc-500 hover:text-amber-500 transition-all mb-12 group font-bold text-sm uppercase tracking-widest"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                All Articles
                            </Link>
                        </motion.div>

                        <div className="flex gap-3 mb-8">
                            <span className="px-4 py-1.5 bg-amber-500/10 text-amber-500 text-xs font-black uppercase tracking-tighter rounded-full border border-amber-500/20 flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5" />
                                {post.category}
                            </span>
                            <span className="px-4 py-1.5 bg-zinc-900/80 text-zinc-400 text-xs font-bold rounded-full border border-zinc-800">
                                {post.readTime}
                            </span>
                        </div>

                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-4xl md:text-7xl font-black text-white mb-10 leading-[1.1] tracking-tight"
                        >
                            {post.title}
                        </motion.h1>

                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="flex flex-wrap items-center gap-8 py-8 border-y border-zinc-800/50 text-sm text-zinc-400 font-medium"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                    <User className="w-5 h-5 text-black" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-black">Author</p>
                                    <p className="text-zinc-200 font-bold">{post.author}</p>
                                </div>
                            </div>
                            
                            <div className="h-8 w-px bg-zinc-800 hidden md:block" />

                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-zinc-600" />
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-black">Published</p>
                                    <p className="text-zinc-300">{post.date}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Main Component Grid */}
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 pb-24">
                    
                    {/* Left Sidebar Actions (Desktop) */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-40 space-y-6 flex flex-col items-center">
                            <button className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-amber-500 hover:border-amber-500/30 transition-all group">
                                <Bookmark className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                            <button 
                                onClick={handleCopy}
                                className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-amber-500 hover:border-amber-500/30 transition-all group"
                            >
                                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                            </button>
                            <div className="h-12 w-px bg-zinc-800" />
                            <Link href="#" className="text-zinc-600 hover:text-blue-400 transition-colors">
                                <Twitter className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="text-zinc-600 hover:text-blue-600 transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Article Content */}
                    <div className="lg:col-span-7">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                            className="aspect-[21/9] relative rounded-[2.5rem] overflow-hidden border border-zinc-800 shadow-2xl shadow-amber-500/5 mb-16"
                        >
                            <Image
                                src={post.image}
                                alt={post.title}
                                fill
                                className="object-cover"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        </motion.div>

                        <div className="prose prose-invert prose-lg max-w-none 
                            prose-headings:font-black prose-headings:text-white prose-headings:tracking-tight
                            prose-h2:text-4xl prose-h2:mt-16 prose-h2:mb-8
                            prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-6
                            prose-p:text-zinc-400 prose-p:leading-[1.8] prose-p:mb-8 prose-p:text-lg
                            prose-strong:text-white prose-strong:font-black
                            prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:bg-zinc-900/50 prose-blockquote:p-8 prose-blockquote:rounded-r-3xl prose-blockquote:italic
                            prose-ul:marker:text-amber-500 prose-li:text-zinc-400
                            prose-hr:border-zinc-800
                        ">
                            <div dangerouslySetInnerHTML={{ __html: post.content }} />
                        </div>

                        {/* Article Footer Actions */}
                        <div className="mt-20 p-10 rounded-[2.5rem] glass-card text-center">
                            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-xl shadow-amber-500/30">
                                <Sparkles className="w-8 h-8 text-black" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4">Did you find this helpful?</h3>
                            <p className="text-zinc-400 mb-8 max-w-md mx-auto">Share your thoughts on social media and tag <span className="text-amber-400 font-bold">@JobGrid</span> to help other students!</p>
                            <div className="flex items-center justify-center gap-4">
                                <button className="px-8 py-3 bg-white text-black font-black rounded-xl hover:scale-105 transition-all">Share Article</button>
                                <button className="px-8 py-3 bg-zinc-800 text-white font-black rounded-xl hover:bg-zinc-700 transition-all">Save for Later</button>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar - Widgets */}
                    <aside className="lg:col-span-4 lg:pl-8 space-y-12">
                        {/* Job of the Day Widget */}
                        <div className="sticky top-28 space-y-8">
                            <div className="p-8 rounded-[2rem] bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-700" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[10px] font-black uppercase tracking-widest">
                                            Featured Career
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-black text-white mb-2 leading-tight">Software Engineer (Intern) at Google</h4>
                                    <p className="text-zinc-500 text-sm mb-6 line-clamp-2">Start your journey at one of the world's most innovative tech companies. Now hiring for Summer 2026.</p>
                                    
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                                            <Briefcase className="w-3.5 h-3.5" />
                                            Full-time Role
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                                            <TrendingUp className="w-3.5 h-3.5" />
                                            ₹35 - 45 LPA
                                        </div>
                                    </div>

                                    <Link 
                                        href="/jobs" 
                                        className="inline-flex items-center justify-center gap-2 w-full py-4 bg-amber-500 text-black font-black rounded-2xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10"
                                    >
                                        View Details
                                        <ChevronRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>

                            {/* Newsletter / CTA */}
                            <div className="p-8 rounded-[2rem] border border-dashed border-zinc-800 text-center">
                                <div className="w-12 h-12 mx-auto mb-4 bg-zinc-900 rounded-xl flex items-center justify-center">
                                    <MessageSquare className="w-6 h-6 text-zinc-600" />
                                </div>
                                <h4 className="text-white font-bold mb-2">Join 10,000+ Students</h4>
                                <p className="text-zinc-500 text-sm mb-6">Get weekly career insights and hidden job opportunities delivered to your inbox.</p>
                                <form className="space-y-3">
                                    <input 
                                        type="email" 
                                        placeholder="your@email.com" 
                                        className="w-full px-5 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm focus:border-amber-500 outline-none transition-all placeholder:text-zinc-700"
                                    />
                                    <button className="w-full py-4 bg-zinc-100 text-black font-black rounded-2xl hover:bg-white transition-all text-sm">Subscribe Free</button>
                                </form>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            <Footer />
        </main>
    );
}
