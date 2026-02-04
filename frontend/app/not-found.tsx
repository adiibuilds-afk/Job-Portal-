import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <main className="min-h-screen bg-black flex items-center justify-center px-6">
            <div className="text-center">
                <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 mb-4">
                    404
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">Page Not Found</h1>
                <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Go Home
                    </Link>
                    <Link
                        href="/jobs"
                        className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-800 text-white font-medium rounded-xl hover:border-zinc-700 transition-colors"
                    >
                        <Search className="w-4 h-4" />
                        Browse Jobs
                    </Link>
                </div>
            </div>
        </main>
    );
}
