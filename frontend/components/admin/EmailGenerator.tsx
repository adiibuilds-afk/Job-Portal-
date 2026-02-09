"use client";

import { useState } from 'react';
import { Sparkles, Send, Eye, Loader, Mail, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function EmailGenerator() {
    const [mode, setMode] = useState<'ai' | 'manual'>('ai');
    const [prompt, setPrompt] = useState('');
    const [tone, setTone] = useState('professional');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [recipients, setRecipients] = useState('');
    const [generating, setGenerating] = useState(false);
    const [sending, setSending] = useState(false);
    const [previewHtml, setPreviewHtml] = useState('');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jobgrid-in.onrender.com';

    const generateEmail = async () => {
        if (!prompt.trim()) {
            toast.error('Please enter a prompt');
            return;
        }

        setGenerating(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/email/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, tone })
            });

            if (!res.ok) throw new Error('Generation failed');

            const data = await res.json();
            setContent(data.content);
            setSubject(data.subject);

            // Get preview
            const previewRes = await fetch(`${API_URL}/api/admin/email/preview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: data.content })
            });
            const previewData = await previewRes.json();
            setPreviewHtml(previewData.html);

            toast.success('Email generated!');
        } catch (err) {
            toast.error('Failed to generate email');
        } finally {
            setGenerating(false);
        }
    };

    const updatePreview = async (newContent: string) => {
        setContent(newContent);
        try {
            const res = await fetch(`${API_URL}/api/admin/email/preview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newContent })
            });
            const data = await res.json();
            setPreviewHtml(data.html);
        } catch (err) { }
    };

    const sendEmail = async () => {
        if (!content || !subject) {
            toast.error('Generate or write an email first');
            return;
        }

        const emailList = recipients
            .split(/[,\n]/)
            .map(e => e.trim())
            .filter(e => e.length > 0);

        if (emailList.length === 0) {
            toast.error('Add at least one recipient');
            return;
        }

        setSending(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/email/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipients: emailList, subject, content })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            toast.success(data.message);
            setRecipients('');
        } catch (err: any) {
            toast.error(err.message || 'Failed to send');
        } finally {
            setSending(false);
        }
    };

    const copyHtml = () => {
        if (previewHtml) {
            navigator.clipboard.writeText(previewHtml);
            toast.success('HTML copied!');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                    <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">AI Email Studio</h2>
                    <p className="text-zinc-500 text-sm">Generate and send beautiful emails with AI</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Generator */}
                <div className="space-y-6">
                    {/* Mode Toggle */}
                    <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
                        <button
                            onClick={() => setMode('ai')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'ai'
                                ? 'bg-zinc-800 text-white shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            AI Generator
                        </button>
                        <button
                            onClick={() => setMode('manual')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'manual'
                                ? 'bg-zinc-800 text-white shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            Manual Entry
                        </button>
                    </div>

                    {/* AI Prompt Input */}
                    {mode === 'ai' && (
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                            <label className="flex items-center gap-2 text-sm font-bold text-zinc-400 mb-3">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                What do you want to say?
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Write a newsletter about our new resume scoring feature..."
                                className="w-full h-32 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
                            />

                            <div className="flex items-center gap-4 mt-4">
                                <select
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value)}
                                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                                >
                                    <option value="professional">Professional</option>
                                    <option value="friendly">Friendly</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="casual">Casual</option>
                                </select>

                                <button
                                    onClick={generateEmail}
                                    disabled={generating || !prompt.trim()}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {generating ? (
                                        <Loader className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-4 h-4" />
                                    )}
                                    Generate Email
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Subject & Content Editor - Show always for manual, or if API generated content */}
                    {(mode === 'manual' || content) && (
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Subject Line</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Enter email subject"
                                    className="w-full mt-2 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Content (HTML)</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => updatePreview(e.target.value)}
                                    placeholder="<p>Hello world...</p>"
                                    className="w-full mt-2 h-48 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-amber-500 resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Recipients - Show if content exists (from AI or manual entry) */}
                    {content && (
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                            <label className="flex items-center gap-2 text-sm font-bold text-zinc-400 mb-3">
                                <Send className="w-4 h-4 text-green-500" />
                                Recipients (comma or newline separated)
                            </label>
                            <textarea
                                value={recipients}
                                onChange={(e) => setRecipients(e.target.value)}
                                placeholder="email1@example.com, email2@example.com&#10;email3@example.com"
                                className="w-full h-28 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 resize-none font-mono text-sm"
                            />

                            <div className="flex items-center justify-between mt-4">
                                <span className="text-xs text-zinc-600">
                                    {recipients.split(/[,\n]/).filter(e => e.trim()).length} recipients
                                </span>
                                <button
                                    onClick={sendEmail}
                                    disabled={sending || !recipients.trim() || !subject || !content}
                                    className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {sending ? (
                                        <Loader className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    Send Email
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Preview */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-bold text-zinc-400">
                            <Eye className="w-4 h-4" />
                            Email Preview
                        </div>
                        {previewHtml && (
                            <button onClick={copyHtml} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-amber-500 transition-colors">
                                <Copy className="w-3 h-3" />
                                Copy HTML
                            </button>
                        )}
                    </div>

                    <div className="h-[600px] overflow-auto bg-gray-100">
                        {previewHtml ? (
                            <iframe
                                srcDoc={previewHtml}
                                className="w-full h-full border-0"
                                title="Email Preview"
                            />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                                <Mail className="w-12 h-12 text-zinc-600 mb-4" />
                                <p className="font-medium">No preview yet</p>
                                <p className="text-sm text-zinc-500">Generate an email or type in manual mode to see preview</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
