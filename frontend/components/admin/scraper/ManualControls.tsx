import { Zap, Clock } from 'lucide-react';
import ScraperButton from './ScraperButton';

interface ManualControlsProps {
    triggerScraper: (name: string, endpoint: string) => void;
}

export default function ManualControls({ triggerScraper }: ManualControlsProps) {
    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 md:gap-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-zinc-800 border border-zinc-700 text-amber-500">
                        <Zap className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-white">Manual Scraper Controls</h3>
                        <p className="text-zinc-500 text-sm">Trigger scrapers on demand (normally run hourly).</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl w-full md:w-auto justify-center md:justify-start">
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
    );
}
