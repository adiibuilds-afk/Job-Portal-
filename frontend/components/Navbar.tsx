"use client";

import Link from 'next/link';
import { Menu, Search, Crown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="fixed top-0 left-0 right-0 z-50 px-4 py-6"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="bg-black/60 backdrop-blur-2xl border border-amber-500/20 rounded-2xl px-6 py-4 flex items-center justify-between shadow-2xl shadow-amber-500/5">

                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-3 group">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:shadow-amber-500/50 transition-all group-hover:scale-105">
                                <Crown className="w-6 h-6 text-black" />
                            </div>
                            <div>
                                <span className="text-xl font-bold text-white">
                                    Job<span className="text-amber-400">Portal</span>
                                </span>
                                <p className="text-xs text-amber-500/60">Premium Careers</p>
                            </div>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden lg:flex items-center space-x-1">
                            {[
                                { name: 'Home', href: '/' },
                                { name: 'All Jobs', href: '/jobs' },
                                { name: 'Internships', href: '/jobs?jobType=Internship' },
                                { name: 'Dashboard', href: '/dashboard' },
                                { name: 'Saved', href: '/saved' },
                            ].map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="px-5 py-2.5 text-sm font-medium text-zinc-400 hover:text-amber-400 rounded-xl hover:bg-amber-500/5 transition-all"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-3">
                            <div className="hidden md:flex items-center bg-zinc-900/80 border border-zinc-800 px-4 py-2.5 rounded-xl">
                                <Search className="w-4 h-4 text-zinc-500 mr-3" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="bg-transparent border-none outline-none text-sm w-28 focus:w-40 transition-all text-white placeholder:text-zinc-600"
                                />
                            </div>

                            <Link
                                href="https://t.me/jobupdatebyadi"
                                target="_blank"
                                className="hidden md:flex px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 transition-all text-sm"
                            >
                                Join Telegram
                            </Link>

                            <button
                                onClick={() => setMobileOpen(true)}
                                className="lg:hidden p-2.5 text-zinc-400 hover:text-amber-400 rounded-xl transition-colors"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
                            className="fixed top-0 right-0 bottom-0 w-80 bg-zinc-900 border-l border-zinc-800 z-50 p-6"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <span className="text-xl font-bold text-white">Menu</span>
                                <button onClick={() => setMobileOpen(false)} className="p-2 text-zinc-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-2">
                                {[
                                    { name: 'Home', href: '/' },
                                    { name: 'All Jobs', href: '/jobs' },
                                    { name: 'Internships', href: '/jobs?jobType=Internship' },
                                    { name: 'Freshers', href: '/jobs?batch=2025' },
                                    { name: 'Saved', href: '/saved' },
                                ].map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className="block px-4 py-3 text-zinc-300 hover:text-amber-400 hover:bg-zinc-800 rounded-xl transition-all"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>

                            <div className="mt-8">
                                <Link
                                    href="https://t.me/jobupdatebyadi"
                                    target="_blank"
                                    className="block w-full py-3 text-center bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold rounded-xl"
                                >
                                    Join Telegram
                                </Link>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
