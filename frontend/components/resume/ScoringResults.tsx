import { CheckCircle, AlertTriangle } from 'lucide-react';
import ScoreGauge from './ScoreGauge';

interface ScoringResultsProps {
    result: {
        score: number;
        summary: string;
        strengths: string[];
        improvements: string[];
        scoreDiff?: number;
    };
    onRestart: () => void;
}

export default function ScoringResults({ result, onRestart }: ScoringResultsProps) {
    return (
        <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8">
                <button
                    onClick={onRestart}
                    className="text-amber-500 font-black text-xs uppercase tracking-widest hover:underline flex items-center gap-1 mb-6"
                >
                    ← Start New Analysis
                </button>

                <div className="flex flex-col items-center justify-center p-8 bg-black/40 border border-zinc-800 rounded-3xl relative overflow-hidden">
                    <ScoreGauge score={result.score} />

                    {result.scoreDiff !== undefined && (
                        <div className={`mt-4 px-4 py-1.5 rounded-full text-sm font-bold border ${result.scoreDiff > 0
                            ? 'bg-green-500/10 text-green-400 border-green-500/30'
                            : result.scoreDiff < 0
                                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                            }`}>
                            {result.scoreDiff > 0 ? '↗' : result.scoreDiff < 0 ? '↘' : '•'}
                            {Math.abs(result.scoreDiff)} point {result.scoreDiff > 0 ? 'Improvement' : result.scoreDiff < 0 ? 'Drop' : 'Change'}
                        </div>
                    )}

                    <div className="mt-8 text-center px-4">
                        <h3 className="text-3xl font-black text-white mb-3 underline decoration-amber-500 decoration-8 underline-offset-8">Score Insights</h3>
                        <p className="text-zinc-400 leading-relaxed font-bold">{result.summary}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-6">
                <div className="bg-green-500/5 border border-green-500/20 rounded-[2.5rem] p-8">
                    <h4 className="text-green-400 font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" /> Score Highlights
                    </h4>
                    <ul className="space-y-4">
                        {result.strengths?.map((s: string, i: number) => (
                            <li key={i} className="flex gap-4 text-zinc-300 text-sm font-bold leading-relaxed">
                                <span className="text-green-500 text-lg">✓</span> {s}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-red-500/5 border border-red-500/20 rounded-[2.5rem] p-8">
                    <h4 className="text-red-400 font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" /> Improvement Plan
                    </h4>
                    <ul className="space-y-4">
                        {result.improvements?.map((s: string, i: number) => (
                            <li key={i} className="flex gap-4 text-zinc-300 text-sm font-bold leading-relaxed">
                                <span className="text-red-500 text-lg">!</span> {s}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
