"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Sparkles, Search, Building2, Briefcase } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import ResumeUpload from '@/components/resume/ResumeUpload';
import QueueStatus from '@/components/resume/QueueStatus';
import ScoringResults from '@/components/resume/ScoringResults';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jobgrid-in.onrender.com';

export default function ResumeScorerTab() {
    const { data: session } = useSession();
    const [resumeText, setResumeText] = useState('');
    const [isGeneralMode, setIsGeneralMode] = useState(true);
    const [customJob, setCustomJob] = useState({ title: '', company: '' });
    const [isExtracting, setIsExtracting] = useState(false);

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

    if (result) {
        return <ScoringResults result={result} onRestart={() => { setResult(null); setResumeText(''); }} />;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-8">
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

                    {queueState.inQueue ? (
                        <QueueStatus position={queueState.position} waitTime={queueState.waitTime} />
                    ) : (
                        <div className="space-y-6">
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

                            <ResumeUpload
                                resumeText={resumeText}
                                setResumeText={setResumeText}
                                isExtracting={isExtracting}
                                setIsExtracting={setIsExtracting}
                            />

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
                    )}
                </div>

                <div className={`flex-1 space-y-6 opacity-20 grayscale pointer-events-none`}>
                    <div className="bg-green-500/5 border border-green-500/20 rounded-[2.5rem] p-8">
                        <h4 className="text-green-400 font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">Details</h4>
                        <p className="text-zinc-500 text-sm">Run scan to see insights...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
