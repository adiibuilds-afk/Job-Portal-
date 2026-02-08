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

                            <div className="hidden md:flex items-center gap-2">
                                <Link
                                    href="https://t.me/jobgridupdates"
                                    target="_blank"
                                    className="p-2.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all"
                                    title="Join Telegram"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                    </svg>
                                </Link>
                                <Link
                                    href="https://whatsapp.com/channel/0029Vak74nQ0wajvYa3aA432"
                                    target="_blank"
                                    className="p-2.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-xl transition-all"
                                    title="WhatsApp Channel"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                                    </svg>
                                </Link>
                            </div>

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
