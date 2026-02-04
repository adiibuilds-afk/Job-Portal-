"use client";

import Link from 'next/link';
import { Crown, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-zinc-950 border-t border-zinc-800">
            <div className="max-w-6xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                                <Crown className="w-5 h-5 text-black" />
                            </div>
                            <span className="text-xl font-bold text-white">Job<span className="text-amber-400">Portal</span></span>
                        </Link>
                        <p className="text-zinc-500 text-sm leading-relaxed">
                            India&apos;s premium job discovery platform. AI-powered matching for government and private sectors.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            {['Home', 'Browse Jobs', 'Govt Jobs', 'Private Jobs', 'About Us'].map((item) => (
                                <li key={item}>
                                    <Link href="/" className="text-zinc-500 hover:text-amber-400 text-sm transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Categories</h4>
                        <ul className="space-y-2">
                            {['IT & Software', 'Banking', 'Government', 'Healthcare', 'Education', 'Engineering'].map((item) => (
                                <li key={item}>
                                    <Link href="/jobs" className="text-zinc-500 hover:text-amber-400 text-sm transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Contact</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2 text-zinc-500 text-sm">
                                <Mail className="w-4 h-4 text-amber-500" />
                                contact@jobportal.com
                            </li>
                            <li className="flex items-center gap-2 text-zinc-500 text-sm">
                                <Phone className="w-4 h-4 text-amber-500" />
                                +91 9876543210
                            </li>
                            <li className="flex items-start gap-2 text-zinc-500 text-sm">
                                <MapPin className="w-4 h-4 text-amber-500 mt-0.5" />
                                New Delhi, India
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-zinc-600 text-sm">© 2024 JobPortal. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <Link href="/privacy" className="text-zinc-600 hover:text-amber-400 text-sm transition-colors">Privacy</Link>
                        <Link href="/terms" className="text-zinc-600 hover:text-amber-400 text-sm transition-colors">Terms</Link>
                        <Link href="/contact" className="text-zinc-600 hover:text-amber-400 text-sm transition-colors">Contact</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
