"use client";

import { Play, Terminal, Zap, Clock, Code, ArrowRight, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

interface ScraperTabProps {
    apiUrl: string;
}

export default function ScraperTab({ apiUrl }: ScraperTabProps) {
    const [testResult, setTestResult] = useState<string>('{ "status": "waiting", "message": "Enter a URL above to test extraction results." }');
    const [testing, setTesting] = useState(false);

    const handleTest = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const url = (e.currentTarget.elements.namedItem('testUrl') as HTMLInputElement).value;
        setTesting(true);
        setTestResult('🤖 Bot is scanning... hold on...');
        try {
            const res = await fetch(`${apiUrl}/api/admin/debug/scrape`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
            const data = await res.json();
            setTestResult(JSON.stringify(data, null, 2));
        } catch (err) {
            setTestResult('❌ Error: ' + (err instanceof Error ? err.message : String(err)));
        } finally {
            setTesting(false);
        }
    };

    const triggerScraper = async (name: string, endpoint: string) => {
        if (!confirm(`This will trigger the ${name} scraper immediately. Continue?`)) return;
        try {
            const res = await fetch(`${apiUrl}/api/admin/scrape/${endpoint}`, { method: 'POST' });
            const data = await res.json();
            toast.success(data.message || `${name} scraper triggered!`);
        } catch (err) {
            toast.error(`Failed to trigger ${name} scraper`);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                        <Terminal className="w-6 h-6 text-white" />
                    </div>
                    Scraper Intelligence Lab
                </h2>
                <p className="text-zinc-500 font-medium">Test extraction logic and manually trigger scrapers.</p>
            </div>

            {/* Debug Tester */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-zinc-800 border border-zinc-700 text-cyan-500">
                        <Code className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-white">URL Extraction Tester</h3>
                        <p className="text-zinc-500 text-sm">See exactly what the bot extracts from any job page.</p>
                    </div>
                </div>

                <form onSubmit={handleTest}>
                    <div className="flex gap-4 mb-6">
                        <input
                            name="testUrl"
                            type="url"
                            placeholder="https://careers.google.com/jobs/results/..."
                            className="flex-1 px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-white outline-none focus:border-cyan-500 transition-all font-mono text-sm"
                            required
                        />
                        <button
                            type="submit"
                            disabled={testing}
                            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black rounded-2xl hover:scale-105 disabled:opacity-50 transition-all flex items-center gap-3 shadow-lg shadow-cyan-500/20"
                        >
                            {testing ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Play className="w-5 h-5" />
                            )}
                            Test Scraper
                        </button>
                    </div>
                </form>

                <div className="bg-black/50 border border-zinc-800 rounded-2xl p-6 font-mono text-xs text-green-500 overflow-auto max-h-[400px] whitespace-pre-wrap">
                    {testResult}
                </div>
            </div>

            {/* Manual Scraper Triggers */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-zinc-800 border border-zinc-700 text-amber-500">
                            <Zap className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-white">Manual Scraper Controls</h3>
                            <p className="text-zinc-500 text-sm">Trigger scrapers on demand (normally run hourly).</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
                        <Clock className="w-4 h-4 text-zinc-500" />
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Auto:</span>
                        <span className="text-zinc-400 font-mono text-sm">0 * * * *</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ScraperButton
                        name="Talentd"
                        emoji="🕷️"
                        color="indigo"
                        onClick={() => triggerScraper('Talentd', 'talentd')}
                    />
                    <ScraperButton
                        name="RG Jobs"
                        emoji="🚀"
                        color="amber"
                        onClick={() => triggerScraper('RG Jobs', 'rgjobs')}
                    />
                    <ScraperButton
                        name="LinkedIn"
                        emoji="💼"
                        color="blue"
                        onClick={() => triggerScraper('LinkedIn', 'linkedin')}
                    />
                </div>
            </div>
        </div>
    );
}

// ================= SUBCOMPONENT =================

function ScraperButton({ name, emoji, color, onClick }: {
    name: string;
    emoji: string;
    color: 'indigo' | 'amber' | 'blue';
    onClick: () => void;
}) {
    const colorMap = {
        indigo: 'from-indigo-500 to-violet-600 shadow-indigo-500/20',
        amber: 'from-amber-500 to-yellow-600 shadow-amber-500/20',
        blue: 'from-blue-500 to-cyan-600 shadow-blue-500/20',
    };

    return (
        <button
            onClick={onClick}
            className={`p-6 bg-gradient-to-br ${colorMap[color]} rounded-3xl text-white font-black text-left shadow-xl hover:scale-105 transition-all group`}
        >
            <div className="text-4xl mb-4">{emoji}</div>
            <div className="flex items-center justify-between">
                <span className="text-xl">{name}</span>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </button>
    );
}
