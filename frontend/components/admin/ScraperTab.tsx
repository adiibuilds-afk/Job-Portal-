import { Play } from 'lucide-react';

interface ScraperTabProps {
    apiUrl: string;
}

export default function ScraperTab({ apiUrl }: ScraperTabProps) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 shadow-2xl">
                <h2 className="text-2xl font-black text-white mb-2">Scraper Intelligence Tester</h2>
                <p className="text-zinc-500 mb-8">Test how the bot "sees" a job page before scheduling it.</p>

                <form onSubmit={async (e) => {
                    e.preventDefault();
                    const url = (e.currentTarget.elements.namedItem('testUrl') as HTMLInputElement).value;
                    const display = document.getElementById('debug-result');
                    if (display) display.innerHTML = '🤖 Bot is scanning... hold on...';
                    try {
                        const res = await fetch(`${apiUrl}/api/admin/debug/scrape`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ url })
                        });
                        const data = await res.json();
                        if (display) display.innerHTML = JSON.stringify(data, null, 2);
                    } catch (err) {
                        if (display) display.innerHTML = '❌ Error: ' + (err instanceof Error ? err.message : String(err));
                    }
                }}>
                    <div className="flex gap-4 mb-8">
                        <input
                            name="testUrl"
                            type="url"
                            placeholder="https://careers.google.com/jobs/results/..."
                            className="flex-1 px-6 py-4 bg-zinc-800 border border-zinc-700 rounded-2xl text-white outline-none focus:border-amber-500 transition-all font-mono text-sm"
                            required
                        />
                        <button type="submit" className="px-8 py-4 bg-amber-500 text-black font-black rounded-2xl hover:bg-amber-400 transition-all flex items-center gap-2">
                            <Play className="w-5 h-5" /> Test Scraper
                        </button>
                    </div>
                </form>

                <div className="bg-black/50 border border-zinc-800 rounded-2xl p-6 font-mono text-xs text-green-500 overflow-auto max-h-[500px] whitespace-pre-wrap" id="debug-result">
                    {`{ "status": "waiting", "message": "Enter a URL above to test extraction results." }`}
                </div>
            </div>

            <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-3xl p-10 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-black text-white mb-2">Auto-Scraper Control</h2>
                        <p className="text-zinc-500">Manage the hourly generic scraper (Talentd, etc).</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={async () => {
                            if (!confirm('This will trigger the Talentd scraper immediately. Continue?')) return;
                            try {
                                const res = await fetch(`${apiUrl}/api/admin/scrape/talentd`, { method: 'POST' });
                                const data = await res.json();
                                alert(data.message);
                            } catch (err) {
                                alert('Failed to trigger Talentd scraper');
                            }
                        }}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                    >
                        🕷️ Scrape Talentd
                    </button>

                    <button
                        onClick={async () => {
                            if (!confirm('This will trigger the RG Jobs scraper immediately. Continue?')) return;
                            try {
                                const res = await fetch(`${apiUrl}/api/admin/scrape/rgjobs`, { method: 'POST' });
                                const data = await res.json();
                                alert(data.message);
                            } catch (err) {
                                alert('Failed to trigger RG Jobs scraper');
                            }
                        }}
                        className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20"
                    >
                        🚀 Scrape RG Jobs
                    </button>

                    <div className="px-6 py-3 bg-zinc-800 rounded-xl text-zinc-400 font-mono text-sm flex items-center">
                        Auto-Schedule: Hourly (0 * * * *)
                    </div>
                </div>
            </div>
        </div>
    );
}
