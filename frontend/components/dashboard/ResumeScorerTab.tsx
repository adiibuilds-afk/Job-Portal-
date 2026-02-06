"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, AlertTriangle, FileText, CheckCircle, Sparkles, Search, Upload, X, Building2, Briefcase } from 'lucide-react';
import axios from 'axios';
import ScoreGauge from '@/components/resume/ScoreGauge';
import { toast } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jobgrid-in.onrender.com';

export default function ResumeScorerTab() {
    const { data: session } = useSession();
    const [resumeText, setResumeText] = useState('');
    const [isGeneralMode, setIsGeneralMode] = useState(true);
    const [customJob, setCustomJob] = useState({ title: '', company: '' });
    const [isExtracting, setIsExtracting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [queueState, setQueueState] = useState<{
        inQueue: boolean;
        position: number;
        waitTime: string;
        queueId: string | null;
        status: string;
    }>({
        inQueue: false,
        position: 0,
        waitTime: '',
        queueId: null,
        status: 'idle'
    });

    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedJobId, setSelectedJobId] = useState('');
    const [recentJobs, setRecentJobs] = useState<any[]>([]);

    useEffect(() => {
        fetchRecentJobs();
    }, []);

    const fetchRecentJobs = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/jobs?limit=5`);
            setRecentJobs(data.jobs || []);
            if (data.jobs?.length > 0) setSelectedJobId(data.jobs[0]._id);
        } catch (err) {
            console.error("Failed to fetch jobs for scorer");
        }
    };

    // Polling Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (queueState.inQueue && queueState.queueId && !['completed', 'failed'].includes(queueState.status)) {
            interval = setInterval(async () => {
                try {
                    const res = await axios.get(`${API_URL}/api/resume/status/${queueState.queueId}`);

                    if (res.data.status === 'completed') {
                        setResult(res.data.result);
                        setQueueState(prev => ({ ...prev, status: 'completed', inQueue: false }));
                        toast.success("Analysis complete!", { icon: '✨' });
                        clearInterval(interval);
                    } else if (res.data.status === 'failed') {
                        setError(res.data.error || 'Analysis failed');
                        setQueueState(prev => ({ ...prev, status: 'failed', inQueue: false }));
                        clearInterval(interval);
                    } else {
                        setQueueState(prev => ({
                            ...prev,
                            status: res.data.status,
                            position: res.data.position || prev.position
                        }));
                    }
                } catch (err) {
                    console.error("Polling error", err);
                }
            }, 5000);
        }

        return () => clearInterval(interval);
    }, [queueState.inQueue, queueState.queueId, queueState.status]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast.error("Please upload a PDF file.");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error("File size exceeds 2MB limit.");
            return;
        }

        setIsExtracting(true);
        try {
            // Dynamic import for pdfjs-dist
            const pdfjsLib = await import('pdfjs-dist');
            // Use the version from the imported library
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const typedarray = new Uint8Array(reader.result as ArrayBuffer);
                    const loadingTask = pdfjsLib.getDocument({
                        data: typedarray,
                    });

                    const pdf = await loadingTask.promise;
                    let fullText = "";

                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map((item: any) => (item as any).str).join(" ");
                        fullText += pageText + "\n";
                    }

                    setResumeText(fullText.trim());
                    setIsExtracting(false);
                    toast.success("Resume text extracted successfully!");
                } catch (innerErr) {
                    console.error("PDF Parsing error", innerErr);
                    toast.error("Error parsing PDF structure.");
                    setIsExtracting(false);
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (err) {
            console.error("PDF library load error", err);
            toast.error("Failed to load PDF processing library.");
            setIsExtracting(false);
        }
    };

    const handleAnalyze = async () => {
        if (!resumeText.trim()) {
            toast.error("Please paste your resume text or upload a PDF.");
            return;
        }

        setError(null);
        setResult(null);

        try {
            const res = await axios.post(`${API_URL}/api/resume/analyze`, {
                email: session?.user?.email,
                jobId: isGeneralMode ? null : selectedJobId,
                customJob: isGeneralMode ? customJob : null,
                resumeText
            });

            if (res.data.success) {
                setQueueState({
                    inQueue: true,
                    queueId: res.data.queueId,
                    position: res.data.position,
                    waitTime: res.data.waitTime,
                    status: 'pending'
                });
                toast.success("Added to analysis queue");
            }
        } catch (err: any) {
            const msg = err.response?.data?.error || "Failed to start analysis.";
            setError(msg);
            toast.error(msg);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left: Input Form */}
                <div className="flex-1 bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-amber-500/10 rounded-2xl">
                            <Sparkles className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">AI Resume Scanner</h2>
                            <p className="text-zinc-500 text-sm">Analyze your resume for ATS compatibility and impact.</p>
                        </div>
                    </div>

                    {!result && !queueState.inQueue ? (
                        <div className="space-y-6">
                            {/* Mode Toggle */}
                            <div className="flex bg-black/50 p-1 rounded-xl border border-zinc-800">
                                <button
                                    onClick={() => setIsGeneralMode(true)}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isGeneralMode ? 'bg-zinc-800 text-amber-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    General Analysis
                                </button>
                                <button
                                    onClick={() => setIsGeneralMode(false)}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isGeneralMode ? 'bg-zinc-800 text-amber-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Job-Specific Match
                                </button>
                            </div>

                            {isGeneralMode ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest pl-1">Target Role (Optional)</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                            <input
                                                type="text"
                                                value={customJob.title}
                                                onChange={(e) => setCustomJob(prev => ({ ...prev, title: e.target.value }))}
                                                placeholder="e.g. Executive"
                                                className="w-full bg-black border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-amber-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest pl-1">Company (Optional)</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                            <input
                                                type="text"
                                                value={customJob.company}
                                                onChange={(e) => setCustomJob(prev => ({ ...prev, company: e.target.value }))}
                                                placeholder="e.g. Google"
                                                className="w-full bg-black border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-amber-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2 pl-1">Select Target Job</label>
                                    <select
                                        value={selectedJobId}
                                        onChange={(e) => setSelectedJobId(e.target.value)}
                                        className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 outline-none appearance-none"
                                    >
                                        {recentJobs.map(job => (
                                            <option key={job._id} value={job._id}>{job.title} at {job.company}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="flex items-center justify-between pl-1">
                                    <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Resume Content</label>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-[10px] text-amber-500 font-black uppercase tracking-widest hover:underline flex items-center gap-1"
                                    >
                                        <Upload className="w-3 h-3" /> Upload PDF
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        accept=".pdf"
                                        className="hidden"
                                    />
                                </div>
                                <div className="relative group">
                                    <textarea
                                        value={resumeText}
                                        onChange={(e) => setResumeText(e.target.value)}
                                        placeholder="Paste your resume content here or upload a PDF above..."
                                        className={`w-full h-64 bg-black border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-300 focus:border-amber-500 outline-none resize-none transition-all ${isExtracting ? 'opacity-50' : ''}`}
                                    />
                                    {isExtracting && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl backdrop-blur-[2px]">
                                            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl shadow-2xl">
                                                <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                                                <span className="text-xs font-bold text-white">Extracting from PDF...</span>
                                            </div>
                                        </div>
                                    )}
                                    {resumeText && (
                                        <button
                                            onClick={() => setResumeText('')}
                                            className="absolute top-4 right-4 p-2 bg-zinc-800/80 rounded-lg text-zinc-500 hover:text-white transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleAnalyze}
                                disabled={!resumeText.trim() || isExtracting}
                                className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-sm rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-amber-500/10 disabled:opacity-50 disabled:grayscale"
                            >
                                <Search className="w-5 h-5" />
                                {isGeneralMode ? 'Run General Career Scan' : 'Run Match Analysis'}
                            </button>
                            <p className="text-center text-[10px] text-zinc-600 uppercase tracking-widest font-black">Daily Limit: 1 Scan per day</p>
                        </div>
                    ) : queueState.inQueue ? (
                        <div className="py-20 text-center space-y-6">
                            <div className="relative inline-block">
                                <Loader2 className="w-16 h-16 text-amber-500 animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-white">
                                    #{queueState.position}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white">In Queue...</h3>
                                <p className="text-zinc-500 font-medium">Wait Time: <span className="text-amber-500 font-bold">{queueState.waitTime}</span></p>
                            </div>
                            <div className="max-w-xs mx-auto h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 animate-pulse w-2/3" />
                            </div>
                        </div>
                    ) : (
                        <div className="py-4 space-y-6">
                            <button
                                onClick={() => { setResult(null); setResumeText(''); }}
                                className="text-amber-500 font-black text-xs uppercase tracking-widest hover:underline flex items-center gap-1"
                            >
                                ← Start New Analysis
                            </button>

                            <div className="flex flex-col items-center justify-center p-8 bg-black/40 border border-zinc-800 rounded-3xl">
                                <ScoreGauge score={result.score} />
                                <div className="mt-8 text-center px-4">
                                    <h3 className="text-3xl font-black text-white mb-3 underline decoration-amber-500 decoration-8 underline-offset-8">Score Insights</h3>
                                    <p className="text-zinc-400 leading-relaxed font-bold">{result.summary}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Detailed Insights */}
                <div className={`flex-1 space-y-6 ${!result ? 'opacity-20 grayscale pointer-events-none' : ''}`}>
                    <div className="bg-green-500/5 border border-green-500/20 rounded-[2.5rem] p-8">
                        <h4 className="text-green-400 font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" /> Score Highlights
                        </h4>
                        <ul className="space-y-4">
                            {result?.strengths?.map((s: string, i: number) => (
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
                            {result?.improvements?.map((s: string, i: number) => (
                                <li key={i} className="flex gap-4 text-zinc-300 text-sm font-bold leading-relaxed">
                                    <span className="text-red-500 text-lg">!</span> {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
