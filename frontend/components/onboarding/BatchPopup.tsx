"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { GraduationCap, ArrowRight, Check } from 'lucide-react';

export default function BatchPopup() {
    const { data: session } = useSession();
    const [isVisible, setIsVisible] = useState(false);
    const [batch, setBatch] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (session?.user?.email) {
            checkUserBatch();
        }
    }, [session]);

    const checkUserBatch = async () => {
        try {
            // Check if user already has a batch
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile?email=${session?.user?.email}`);
            if (data.user && !data.user.batch) {
                // Delay slightly for better UX
                setTimeout(() => setIsVisible(true), 1500);
            }
        } catch (error) {
            console.error('Failed to check batch', error);
        }
    };

    const handleSubmit = async () => {
        if (!batch) return;
        setLoading(true);
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile/update`, {
                email: session?.user?.email, // Middleware uses this to find user for now
                batch
            });
            setSuccess(true);
            setTimeout(() => setIsVisible(false), 2000);
        } catch (error) {
            console.error('Failed to update batch', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
                        <GraduationCap className="w-8 h-8 text-black" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">One Last Thing! 🎓</h2>
                    <p className="text-zinc-400">
                        Select your passing year so we can send you relevant job alerts.
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-8">
                    {['2025', '2026', '2027','2028', '2029', 'Other'].map((year) => (
                        <button
                            key={year}
                            onClick={() => setBatch(year)}
                            className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${batch === year
                                    ? 'bg-amber-500 text-black border-amber-500 scale-105 shadow-lg shadow-amber-500/20'
                                    : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-600 hover:text-white'
                                }`}
                        >
                            {year}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={!batch || loading || success}
                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${success
                            ? 'bg-green-500 text-black'
                            : 'bg-white text-black hover:bg-zinc-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {loading ? (
                        <span className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent" />
                    ) : success ? (
                        <>
                            <Check className="w-5 h-5" />
                            All Set!
                        </>
                    ) : (
                        <>
                            Show Me Jobs <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
