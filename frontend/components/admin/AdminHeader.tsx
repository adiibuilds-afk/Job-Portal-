import Link from 'next/link';
import { Settings } from 'lucide-react';

export default function AdminHeader() {
    return (
        <div className="flex items-center justify-between mb-10">
            <div>
                <h1 className="text-4xl font-black text-white flex items-center gap-3">
                    <Settings className="w-8 h-8 text-amber-500" />
                    Command Center
                </h1>
                <p className="text-zinc-500 mt-1">Platform management & automation hub</p>
            </div>
            <Link href="/" className="px-6 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl hover:text-white transition-all flex items-center gap-2">
                View Live Site
            </Link>
        </div>
    );
}
