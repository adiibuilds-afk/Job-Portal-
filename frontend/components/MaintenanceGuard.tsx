"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Hammer, Sparkles, LogOut } from "lucide-react";
import Link from "next/link";

export default function MaintenanceGuard({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [isMaintenance, setIsMaintenance] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkMaintenance();
    }, []);

    const checkMaintenance = async () => {
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://jobgrid-in.onrender.com';
            const res = await fetch(`${apiBase}/api/admin/settings`);
            const settings = await res.json();
            setIsMaintenance(settings.maintenance_mode === true);
        } catch (error) {
            console.error("Maintenance check failed:", error);
        } finally {
            setLoading(false);
        }
    };

    // Admins and owners bypass maintenance
    const isAdmin = session?.user?.email === 'kanishkasuraj0000@gmail.com' || (session?.user as any)?.role === 'admin';

    if (loading) return children;

    if (isMaintenance && !isAdmin) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="relative z-10 max-w-2xl">
                    <div className="w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-amber-500/10 group">
                        <Hammer className="w-10 h-10 text-amber-500 animate-bounce" />
                    </div>

                    <h1 className="text-5xl font-black text-white mb-6 tracking-tight">
                        We're Polishing <br />
                        <span className="text-amber-500 flex items-center justify-center gap-3">
                            The Grid <Sparkles className="w-8 h-8" />
                        </span>
                    </h1>

                    <p className="text-zinc-500 text-lg font-medium leading-relaxed mb-10 max-w-md mx-auto">
                        JobGrid is currently undergoing scheduled maintenance to bring you even better features. We'll be back shortly!
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-sm mx-auto">
                        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl">
                            <div className="text-zinc-400 text-xs font-black uppercase tracking-widest mb-1">Status</div>
                            <div className="text-amber-500 font-bold">In Progress</div>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl">
                            <div className="text-zinc-400 text-xs font-black uppercase tracking-widest mb-1">ETA</div>
                            <div className="text-white font-bold">~30 Mins</div>
                        </div>
                    </div>

                    <div className="mt-12 pt-12 border-t border-zinc-900">
                        <Link href="/privacy" className="text-zinc-600 hover:text-zinc-400 text-sm font-bold transition-colors">
                            Privacy Policy
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return children;
}
