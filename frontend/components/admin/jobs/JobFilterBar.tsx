import { Search, AlertTriangle, Trash2 } from 'lucide-react';

interface JobFilterBarProps {
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    jobFilter: 'all' | 'reported';
    setJobFilter: (f: 'all' | 'reported') => void;
    totalCount: number;
    reportedCount: number;
    onClearReported: () => void;
    selectedCount: number;
    onBulkDelete: () => void;
    isDeleting: boolean;
}

export default function JobFilterBar({
    searchQuery, setSearchQuery, jobFilter, setJobFilter,
    totalCount, reportedCount, onClearReported,
    selectedCount, onBulkDelete, isDeleting
}: JobFilterBarProps) {
    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-6">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search jobs by title or company..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 transition-all font-medium"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-zinc-950 border border-zinc-800 rounded-2xl p-1">
                        <button
                            onClick={() => setJobFilter('all')}
                            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${jobFilter === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-white'}`}
                        >
                            All ({totalCount})
                        </button>
                        <button
                            onClick={() => setJobFilter('reported')}
                            className={`px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${jobFilter === 'reported' ? 'bg-red-500/10 text-red-500' : 'text-zinc-600 hover:text-red-400'}`}
                        >
                            <AlertTriangle className="w-3 h-3" /> Reported ({reportedCount})
                        </button>
                    </div>

                    {selectedCount > 0 && (
                        <button
                            onClick={onBulkDelete}
                            disabled={isDeleting}
                            className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-red-500/20 uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDeleting ? <span className="animate-spin">⏳</span> : <Trash2 className="w-4 h-4" />}
                            Delete Selected ({selectedCount})
                        </button>
                    )}

                    {reportedCount > 0 && selectedCount === 0 && (
                        <button
                            onClick={onClearReported}
                            className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-black rounded-xl transition-all border border-red-500/20 uppercase tracking-wider flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" /> Clear Reported
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
