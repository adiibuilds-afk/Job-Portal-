import { ShieldCheck, Sparkles } from 'lucide-react';

interface CleanupUtilityProps {
    onRun: () => void;
    loading: boolean;
}

export default function CleanupUtility({ onRun, loading }: CleanupUtilityProps) {
    return (
        <div className="bg-zinc-950 border border-amber-500/20 p-10 rounded-[2.5rem] text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/5 blur-[100px] -ml-32 -mt-32" />
            <div className="relative z-10">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-500/20">
                    <ShieldCheck className="w-8 h-8 text-black" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Smart Cleanup Utility</h2>
                <p className="text-zinc-500 max-w-lg mx-auto mb-8">
                    AI-Powered maintenance that identifies and removes expired, low-engagement, or outdated job listings to keep your platform premium.
                </p>
                <button
                    onClick={onRun}
                    disabled={loading}
                    className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black rounded-2xl hover:scale-105 disabled:opacity-50 transition-all flex items-center gap-3 mx-auto shadow-xl shadow-amber-500/20"
                >
                    <Sparkles className="w-5 h-5" />
                    {loading ? 'Cleaning Hub...' : 'Run Smart Cleanup Now'}
                </button>
            </div>
        </div>
    );
}
