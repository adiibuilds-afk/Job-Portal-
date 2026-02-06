"use client";

import Link from 'next/link';
import { Crown, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-zinc-950 border-t border-zinc-800 relative z-10">
            <div className="max-w-6xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-10">

                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                                <Crown className="w-5 h-5 text-black" />
                            </div>
                            <span className="text-xl font-bold text-white">Job<span className="text-amber-400">Grid</span></span>
                        </Link>
                        <p className="text-zinc-500 text-sm leading-relaxed">
                            India&apos;s premium job discovery platform. AI-powered matching for government and private sectors.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Company</h4>
                        <ul className="space-y-2">
                            {[
                                { name: 'About Us', href: '/about' },
                                { name: 'Contact Us', href: '/contact' },
                                { name: 'Updates', href: '/updates' },
                                { name: 'Privacy Policy', href: '/privacy' },
                                { name: 'Disclaimer', href: '/disclaimer' },
                                { name: 'Terms & Conditions', href: '/terms' }
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="text-zinc-500 hover:text-amber-400 text-sm transition-colors">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Popular Searches (SEO) */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Popular Searches</h4>
                        <ul className="space-y-2">
                            {['Remote Jobs', 'Bangalore Jobs', 'Frontend Jobs', 'SDE Jobs', 'Freshers 2024'].map((item) => (
                                <li key={item}>
                                    <Link
                                        href={`/jobs/${item.toLowerCase().replace(/ /g, '-')}`}
                                        className="text-zinc-500 hover:text-amber-400 text-sm transition-colors"
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Job Categories</h4>
                        <ul className="space-y-2">
                            {['Engineering', 'Software', 'Data Science', 'SDE', 'Internships'].map((item) => (
                                <li key={item}>
                                    <Link href={`/jobs?q=${item}`} className="text-zinc-500 hover:text-amber-400 text-sm transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Contact Hub</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2 text-zinc-500 text-sm">
                                <Mail className="w-4 h-4 text-amber-500" />
                                support@jobgrid.in
                            </li>
                            <li className="flex items-start gap-2 text-zinc-500 text-sm">
                                <MapPin className="w-4 h-4 text-amber-500 mt-0.5" />
                                Remote, India
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-zinc-600 text-sm">© 2026 JobGrid. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <Link href="/privacy" className="text-zinc-600 hover:text-amber-400 text-sm transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="text-zinc-600 hover:text-amber-400 text-sm transition-colors">Terms of Service</Link>
                        <Link href="/disclaimer" className="text-zinc-600 hover:text-amber-400 text-sm transition-colors">Disclaimer</Link>
                        <Link href="/contact" className="text-zinc-600 hover:text-amber-400 text-sm transition-colors">Contact</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
