"use client";

import { Terminal } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import DebugTester from './scraper/DebugTester';
import ManualControls from './scraper/ManualControls';

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

            <DebugTester
                handleTest={handleTest}
                testing={testing}
                testResult={testResult}
            />

            <ManualControls triggerScraper={triggerScraper} />
        </div>
    );
}
