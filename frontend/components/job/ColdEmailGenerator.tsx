"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Copy, Mail, Check, RefreshCw } from 'lucide-react';

interface ColdEmailGeneratorProps {
    jobTitle: string;
    company: string;
    tags?: string[];
}

export default function ColdEmailGenerator({ jobTitle, company, tags = [] }: ColdEmailGeneratorProps) {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    // Skills to highlight (take top 3 tags or defaults)
    const skills = tags.length > 0 ? tags.slice(0, 3).join(", ") : "[Key Skills]";
    const userName = session?.user?.name || "[Your Name]";

    const generateEmail = () => {
        return `Subject: Application for ${jobTitle} at ${company} - ${userName}

Hi Hiring Manager,

I’ve been following ${company}’s work and was excited to see the ${jobTitle} opening.

I have strong experience with ${skills}, and I am passionate about building scalable solutions. In my recent project, I built a system that [Mention a key achievement].

I’d love to bring my expertise to your team. My resume is attached for your review.

Best,
${userName}`;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generateEmail());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) {
        return (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-400" />
                    Cold Email Generator
                </h4>
                <p className="text-zinc-500 text-xs mb-4">
                    Stand out! Generate a personalized email to send to recruiters.
                </p>
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold rounded-xl border border-zinc-700 transition-all flex items-center justify-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    Generate Template
                </button>
            </div>
        );
    }

    return (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-400" />
                    Your Draft
                </h4>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-xs text-zinc-500 hover:text-white"
                >
                    Close
                </button>
            </div>

            <div className="bg-black/50 border border-zinc-800 rounded-xl p-3 mb-4">
                <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-sans">
                    {generateEmail()}
                </pre>
            </div>

            <button
                onClick={handleCopy}
                className={`w-full py-2.5 text-sm font-bold rounded-xl border transition-all flex items-center justify-center gap-2 ${copied
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : "bg-purple-600 hover:bg-purple-500 text-white border-purple-500"
                    }`}
            >
                {copied ? (
                    <>
                        <Check className="w-4 h-4" />
                        Copied to Clipboard
                    </>
                ) : (
                    <>
                        <Copy className="w-4 h-4" />
                        Copy Email
                    </>
                )}
            </button>
        </div>
    );
}
