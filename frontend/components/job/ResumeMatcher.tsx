"use client";

import { useState } from 'react';
import axios from 'axios';
import { FileText, Search, AlertCircle, CheckCircle } from 'lucide-react';

interface ResumeMatcherProps {
    jobId: string;
    jobTitle: string;
}

export default function ResumeMatcher({ jobId, jobTitle }: ResumeMatcherProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [resumeText, setResumeText] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!resumeText.trim()) return;
        setLoading(true);
        try {
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/resume/analyze`, {
                jobId,
                resumeText
            });
            setResult(data);
        } catch (error) {
            console.error(error);
            alert("Analysis failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 mt-6">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    AI Resume Scanner
                </h4>
                <p className="text-zinc-400 text-xs mb-4">
                    See if your resume passes the ATS filter for this {jobTitle} role.
                </p>
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                >
                    <Search className="w-4 h-4" />
                    Check My Match Score
                </button>
            </div>
        );
    }

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    Resume Matcher
                </h4>
                <button onClick={() => setIsOpen(false)} className="text-xs text-zinc-500 hover:text-white">Close</button>
            </div>

            {!result ? (
                <div className="space-y-4">
                    <textarea
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Paste your resume text (or summary) here to analyze..."
                        className="w-full h-32 bg-black border border-zinc-700 rounded-xl p-3 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                    />
                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !resumeText}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : "Analyze Match"}
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Score Circle */}
                    <div className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-zinc-800">
                        <div className={`relative w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-4 ${result.score > 70 ? 'border-green-500 text-green-400' : result.score > 40 ? 'border-yellow-500 text-yellow-400' : 'border-red-500 text-red-400'}`}>
                            {result.score}%
                        </div>
                        <div>
                            <p className="text-white font-bold">Match Score</p>
                            <p className="text-xs text-zinc-400">{result.score > 70 ? "Excellent! Apply now." : "Needs improvement."}</p>
                        </div>
                    </div>

                    {/* Missing Keywords */}
                    {result.missing && result.missing.length > 0 && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                            <p className="text-red-400 text-xs font-bold mb-2 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> MISSING KEYWORDS
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {result.missing.map((word: string) => (
                                    <span key={word} className="px-2 py-1 bg-red-500/10 text-red-300 text-xs rounded border border-red-500/20">
                                        {word}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Matched Keywords */}
                    {result.matched && result.matched.length > 0 && (
                        <div>
                            <p className="text-green-400 text-xs font-bold mb-2 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> MATCHED SKILLS
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {result.matched.map((word: string) => (
                                    <span key={word} className="px-2 py-1 bg-green-500/10 text-green-300 text-xs rounded border border-green-500/20">
                                        {word}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => { setResult(null); setResumeText(''); }}
                        className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors"
                    >
                        Check Another
                    </button>
                </div>
            )}
        </div>
    );
}
