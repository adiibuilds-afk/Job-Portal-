import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { blogPosts } from '@/data/blogPosts';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Calendar, Clock, BookOpen, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Career Blog | JobGrid',
    description: 'Expert career advice, interview preparation tips, and industry trends to help you land your dream tech job.',
    alternates: {
        canonical: '/blog',
    },
};

export default function BlogIndex() {
    return (
        <main className="min-h-screen bg-black">
            <section className="pt-32 pb-16 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none" />
                
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-bold mb-6">
                            <BookOpen className="w-4 h-4" />
                            Career Resources
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
                            Insights to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600">Accelerate</span> Your Career
                        </h1>
                        <p className="text-lg text-zinc-400">
                            Expert advice on resumes, FAANG interviews, and navigating the tech industry.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogPosts.map((post) => (
                            <Link 
                                href={`/blog/${post.slug}`} 
                                key={post.id}
                                className="group relative bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden hover:border-amber-500/30 transition-all flex flex-col"
                            >
                                <div className="aspect-[16/9] relative overflow-hidden bg-zinc-800">
                                    <Image
                                        src={post.image}
                                        alt={post.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-80" />
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-bold rounded-lg border border-white/10">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4 font-medium">
                                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{post.date}</span>
                                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{post.readTime}</span>
                                    </div>
                                    
                                    <h2 className="text-xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors line-clamp-2">
                                        {post.title}
                                    </h2>
                                    
                                    <p className="text-zinc-400 text-sm line-clamp-3 mb-6 flex-1">
                                        {post.excerpt}
                                    </p>
                                    
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800/50">
                                        <span className="text-sm font-medium text-zinc-300">{post.author}</span>
                                        <span className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-colors">
                                            <ChevronRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
            
            <Footer />
        </main>
    );
}
