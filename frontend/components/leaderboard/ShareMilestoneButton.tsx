'use client';

import { useSession } from 'next-auth/react';
import { Share2, Linkedin, MessageCircle, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ShareMilestoneButton() {
    const { data: session } = useSession();

    const handleShare = (platform: 'linkedin' | 'whatsapp') => {
        if (!session) {
            toast.error('Sign in to share your rank!');
            return;
        }

        const shareUrl = `https://jobgrid.in/join?ref=${encodeURIComponent(session.user?.email || '')}`;
        const text = `I'm using JobGrid to find the latest jobs for 2025, 2026, 2027 & 2028 batches! Join me and let's secure our placement together. 🚀`;

        if (platform === 'whatsapp') {
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + shareUrl)}`);
        } else {
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`);
        }
    };

    return (
        <div className="space-y-3">
            <button
                onClick={() => handleShare('whatsapp')}
                className="w-full flex items-center justify-between px-6 py-3 bg-white text-blue-600 rounded-2xl font-black text-sm hover:scale-[1.02] transition-all"
            >
                Invite Batchmates
                <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex gap-2">
                <button
                    onClick={() => handleShare('whatsapp')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500/20 text-green-200 border border-green-500/30 rounded-xl text-[10px] font-bold hover:bg-green-500/30 transition-all uppercase tracking-widest"
                >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp
                </button>
                <button
                    onClick={() => handleShare('linkedin')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-400/20 text-blue-200 border border-blue-400/30 rounded-xl text-[10px] font-bold hover:bg-blue-400/30 transition-all uppercase tracking-widest"
                >
                    <div className="w-3.5 h-3.5 flex items-center justify-center font-bold">in</div>
                    LinkedIn
                </button>
            </div>
        </div>
    );
}
