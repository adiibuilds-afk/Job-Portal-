'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="min-h-screen bg-black flex items-center justify-center px-6">
            <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-10 h-10 text-red-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">Something went wrong</h1>
                <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                    An unexpected error occurred. Please try again.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={reset}
                        className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-800 text-white font-medium rounded-xl hover:border-zinc-700 transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Go Home
                    </Link>
                </div>
            </div>
        </main>
    );
}
