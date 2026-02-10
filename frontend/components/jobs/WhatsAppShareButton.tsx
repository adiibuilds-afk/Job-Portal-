"use client";

import { MessageSquare, Share2 } from 'lucide-react';
import { Job } from '@/types';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface WhatsAppShareButtonProps {
    job: Job;
    referralCode?: string;
    variant?: 'icon' | 'full';
    className?: string;
    onShare?: () => void;
}

export default function WhatsAppShareButton({ job, referralCode, variant = 'icon', className = '', onShare }: WhatsAppShareButtonProps) {

    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const websiteUrl = window.location.origin;
        const shareUrl = `${websiteUrl}/job/${job.slug}${referralCode ? `?ref=${referralCode}` : ''}`;

        const message = `🚨 *JOB ALERT*: ${job.company} is hiring!\n\n` +
            `💡 *Role*: ${job.title}\n` +
            `🎓 *Batch*: ${job.batch?.join(', ') || 'Any'}\n` +
            `💰 *Salary*: ${job.salary || 'Competitive'}\n` +
            `📍 *Location*: ${job.location || 'Remote'}\n\n` +
            `🔗 *Apply here*: ${shareUrl}\n\n` +
            `_(Sent via JobGrid.in - Your Career Grid)_`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

        // Track the share in backend (optional, but good for growth analytics)
        if (referralCode) {
            try {
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/user/coins/share`, {
                    referralCode
                });
            } catch (error) {
                console.error('Failed to track share', error);
            }
        }

        window.open(whatsappUrl, '_blank');

        if (onShare) onShare();
        toast.success('Opening WhatsApp...', { icon: '📲' });
    };

    if (variant === 'icon') {
        return (
            <button
                onClick={handleShare}
                className={`w-9 h-9 rounded-xl flex items-center justify-center bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-white transition-all ${className}`}
                title="Share on WhatsApp"
            >
                <MessageSquare className="w-4 h-4" />
            </button>
        );
    }

    return (
        <button
            onClick={handleShare}
            className={`flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all active:scale-95 ${className}`}
        >
            <Share2 className="w-4 h-4" />
            Share to WhatsApp
        </button>
    );
}
