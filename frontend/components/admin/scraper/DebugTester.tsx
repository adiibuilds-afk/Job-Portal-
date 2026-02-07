import { Play, Code } from 'lucide-react';

interface DebugTesterProps {
    handleTest: (e: React.FormEvent<HTMLFormElement>) => void;
    testing: boolean;
    testResult: string;
}

export default function DebugTester({ handleTest, testing, testResult }: DebugTesterProps) {
    return (
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
    );
}
