import { Sparkles, ExternalLink, Zap } from 'lucide-react';
import { AISuggestion } from './types';

interface AISuggestionsProps {
    suggestions: AISuggestion[];
    loading: boolean;
    selectedBatch: string;
    onUse: (suggestion: AISuggestion) => void;
}

export default function AISuggestions({ suggestions, loading, selectedBatch, onUse }: AISuggestionsProps) {
    return (
        <section className="bg-zinc-950 border border-amber-500/20 rounded-[2.5rem] p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] -mr-32 -mt-32" />

            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-white flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-amber-500" /> AI-Suggested Alerts
                </h3>
                <span className="text-xs font-black text-zinc-600 uppercase tracking-widest">
                    Based on {selectedBatch} batch patterns
                </span>
            </div>

            <div className="space-y-4">
                {loading ? (
                    Array(3).fill(0).map((_, idx) => (
                        <div key={idx} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-5 animate-pulse">
                            <div className="h-6 w-1/3 bg-zinc-800 rounded mb-2" />
                            <div className="h-4 w-1/2 bg-zinc-800/50 rounded" />
                        </div>
                    ))
                ) : suggestions.map((suggestion) => (
                    <div key={suggestion._id} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-amber-500/30 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg ${suggestion.matchScore >= 85 ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                suggestion.matchScore >= 75 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                    'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                }`}>
                                {suggestion.matchScore}%
                            </div>
                            <div>
                                <div className="font-bold text-white leading-none mb-1 text-lg flex items-center gap-2">
                                    {suggestion.company} — {suggestion.title}
                                    <a href={`/job/${suggestion.slug}`} target="_blank" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ExternalLink className="w-4 h-4 text-zinc-500" />
                                    </a>
                                </div>
                                <p className="text-zinc-500 text-sm font-medium">{suggestion.matchReason}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => onUse(suggestion)}
                            className="px-6 py-3 bg-amber-500 text-black font-black rounded-2xl text-sm hover:scale-105 transition-all shadow-lg shadow-amber-500/10 flex items-center gap-2"
                        >
                            <Zap className="w-4 h-4" /> Use Suggestion
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}
