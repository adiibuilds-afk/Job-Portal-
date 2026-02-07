"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Menu, Search, Crown, X, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, Suspense } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import BatchSelectionModal from './BatchSelectionModal';

function NavbarContent() {
    const { data: session } = useSession();
    const [mobileOpen, setMobileOpen] = useState(false);
    const searchParams = useSearchParams();
    const q = searchParams.get('q') || '';

    // Batch Logic
    const [showBatchModal, setShowBatchModal] = useState(false);
    const userBatch = (session?.user as any)?.batch;

    const handleBatchClick = (e: React.MouseEvent) => {
        // Check if user is logged in first
        if (!session) {
            e.preventDefault();
            signIn('google');
            return;
        }

        // If logged in but no batch, show modal
        if (!userBatch) {
            e.preventDefault();
            setShowBatchModal(true);
        }
    };

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'All Jobs', href: '/jobs' },
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Forum', href: '/forum' },
        // Dynamic Batch Link
        {
            name: userBatch ? `Jobs for ${userBatch}` : 'Jobs for your Batch',
            href: userBatch ? `/jobs?batch=${userBatch}` : '#',
            onClick: handleBatchClick
        },
    ];

    return (
        <>
            <BatchSelectionModal
                isOpen={showBatchModal}
                onClose={() => setShowBatchModal(false)}
                onBatchSelect={(batch) => {
                    // Optional: Redirect immediately after selection
                    // window.location.href = `/jobs?batch=${batch}`;
                }}
            />
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
                                    Job<span className="text-amber-400">Grid</span>
                                </span>
                                <p className="text-xs text-amber-500/60">Premium Careers</p>
                            </div>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden lg:flex items-center space-x-1">
                            {navLinks.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={item.onClick}
                                    className="px-5 py-2.5 text-sm font-medium text-zinc-400 hover:text-amber-400 rounded-xl hover:bg-amber-500/5 transition-all"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-3">
                            <form action="/jobs" className="hidden md:flex items-center bg-zinc-900/80 border border-zinc-800 px-4 py-2.5 rounded-xl">
                                <Search className="w-4 h-4 text-zinc-500 mr-3" />
                                <input
                                    type="text"
                                    name="q"
                                    placeholder="Search..."
                                    defaultValue={q}
                                    className="bg-transparent border-none outline-none text-sm w-28 focus:w-40 transition-all text-white placeholder:text-zinc-600"
                                />
                            </form>

                            {session ? (
                                <div className="hidden md:flex items-center gap-3">
                                    <Link href="/profile">
                                        {session.user?.image ? (
                                            <img
                                                src={session.user.image}
                                                alt="Profile"
                                                className="w-10 h-10 rounded-full border border-zinc-700"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center font-bold text-black border border-amber-400">
                                                {session.user?.name?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                    </Link>
                                    <button
                                        onClick={() => signOut()}
                                        className="text-zinc-400 hover:text-white text-sm font-medium"
                                    >
                                        Log Out
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => signIn('google')}
                                    className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white text-zinc-950 font-bold rounded-xl transition-all text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95"
                                >
                                    <LogIn className="w-4 h-4" />
                                    <span>Log In</span>
                                </button>
                            )}

                            <Link
                                href="https://t.me/jobgridupdates"
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

                            {session && (
                                <div className="flex items-center gap-3 mb-6 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                                    {session.user?.image ? (
                                        <img src={session.user.image} alt="Profile" className="w-10 h-10 rounded-full" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center font-bold text-black">
                                            {session.user?.name?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-white font-semibold text-sm">{session.user?.name}</p>
                                        <p className="text-zinc-500 text-xs">{session.user?.email}</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                {navLinks.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className="block px-4 py-3 text-zinc-300 hover:text-amber-400 hover:bg-zinc-800 rounded-xl transition-all"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                                {session && (
                                    <Link
                                        href="/profile"
                                        onClick={() => setMobileOpen(false)}
                                        className="block px-4 py-3 text-zinc-300 hover:text-amber-400 hover:bg-zinc-800 rounded-xl transition-all"
                                    >
                                        My Profile
                                    </Link>
                                )}
                            </div>

                            <div className="mt-8 space-y-3">
                                {session ? (
                                    <button
                                        onClick={() => signOut()}
                                        className="block w-full py-3 text-center bg-zinc-800 text-white font-bold rounded-xl border border-zinc-700"
                                    >
                                        Log Out
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => signIn('google')}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-100 text-black font-bold rounded-xl hover:bg-white transition-all"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        Log In with Google
                                    </button>
                                )}
                                <Link
                                    href="https://t.me/jobgridupdates"
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

export default function Navbar() {
    return (
        <Suspense fallback={<div className="fixed top-0 left-0 right-0 z-50 px-4 py-6"><div className="max-w-7xl mx-auto h-20 bg-black/60 rounded-2xl" /></div>}>
            <NavbarContent />
        </Suspense>
    );
}
