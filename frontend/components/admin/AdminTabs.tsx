import { List, Clock, MousePointer, BarChart3, Bell } from 'lucide-react';

interface AdminTabsProps {
    activeTab: 'jobs' | 'queue' | 'analytics' | 'scraper' | 'alerts';
    setActiveTab: (tab: 'jobs' | 'queue' | 'analytics' | 'scraper' | 'alerts') => void;
    pendingCount: number;
}

export default function AdminTabs({ activeTab, setActiveTab, pendingCount }: AdminTabsProps) {
    return (
        <div className="flex bg-zinc-900/50 p-1.5 rounded-2xl w-fit mb-10 border border-zinc-800">
            <button
                onClick={() => setActiveTab('jobs')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'jobs' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-white'}`}
            >
                <List className="w-4 h-4" /> Jobs
            </button>
            <button
                onClick={() => setActiveTab('queue')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'queue' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-white'}`}
            >
                <Clock className="w-4 h-4" /> Bot Queue
                {pendingCount > 0 && (
                    <span className="bg-black text-amber-500 text-[10px] px-1.5 py-0.5 rounded-md ml-1">
                        {pendingCount}
                    </span>
                )}
            </button>
            <button
                onClick={() => setActiveTab('scraper')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'scraper' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-white'}`}
            >
                <MousePointer className="w-4 h-4" /> Scraper Test
            </button>
            <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'analytics' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-white'}`}
            >
                <BarChart3 className="w-4 h-4" /> Analytics
            </button>
            <button
                onClick={() => setActiveTab('alerts')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'alerts' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-white'}`}
            >
                <Bell className="w-4 h-4" /> Alerts
            </button>
        </div>
    );
}
