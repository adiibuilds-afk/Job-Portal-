"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Send, Users, Briefcase, ChevronDown, Sparkles, Activity, CheckCircle2, AlertCircle, TrendingUp, Zap, ExternalLink } from 'lucide-react';
import { Job } from '@/types';

const BATCH_OPTIONS = [
    { label: '< 2023', value: 'older-2023' },
    { label: '2023', value: '2023' },
    { label: '2024', value: '2024' },
    { label: '2025', value: '2025' },
    { label: '2026', value: '2026' },
    { label: '2027', value: '2027' },
    { label: '2028', value: '2028' },
    { label: '2029', value: '2029' },
    { label: '> 2029', value: 'greater-2029' },
];

interface AISuggestion {
    _id: string;
    title: string;
    company: string;
    location: string;
    slug: string;
    matchScore: number;
    matchReason: string;
}

export default function BatchAlerts() {
    const [selectedBatches, setSelectedBatches] = useState<string[]>(['2025']);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJobId, setSelectedJobId] = useState('');
    const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
    const [analytics, setAnalytics] = useState({ openRate: 0, ctr: 0 });
    const [loadingSuggestions, setLoadingSuggestions] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jobgrid-in.onrender.com';

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchAISuggestions();
    }, [selectedBatches]);

    const fetchData = async () => {
        try {
            const [countsRes, jobsRes, analyticsRes] = await Promise.all([
                axios.get(`${API_URL}/api/admin/user-counts`),
                axios.get(`${API_URL}/api/jobs?limit=20`),
                axios.get(`${API_URL}/api/admin/broadcast-analytics`)
            ]);
            setCounts(countsRes.data);
            setJobs(jobsRes.data.jobs);
            setAnalytics({
                openRate: analyticsRes.data.openRate,
                ctr: analyticsRes.data.ctr
            });
        } catch (error) {
            console.error('Failed to fetch alert data:', error);
        }
    };

    const fetchAISuggestions = async () => {
        setLoadingSuggestions(true);
        try {
            const batch = selectedBatches[0] || '2025';
            const res = await axios.get(`${API_URL}/api/admin/ai-job-suggestions?batch=${batch}`);
            setAiSuggestions(res.data.suggestions);
        } catch (error) {
            console.error('Failed to fetch AI suggestions:', error);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const toggleBatch = (val: string) => {
        setSelectedBatches(prev =>
            prev.includes(val) ? prev.filter(b => b !== val) : [...prev, val]
        );
    };

    const handleJobSelect = (jobId: string) => {
        setSelectedJobId(jobId);
        const job = jobs.find(j => j._id === jobId);
        if (job) {
            setSubject(`🔥 New Opportunity: ${job.title} at ${job.company}`);
            setMessage(`Hello!\n\nA new job has been posted that matches your profile:\n\n🚀 ${job.title}\n🏢 ${job.company}\n📍 ${job.location || 'Remote'}\n💰 ${job.salary || 'Best in Industry'}\n\nCheck out the full details and apply here:\nhttps://jobgrid.in/job/${job.slug}\n\nDon't miss out on this opportunity!`);
        }
    };

    const useSuggestion = (suggestion: AISuggestion) => {
        setSubject(`🔥 New Opportunity: ${suggestion.title} at ${suggestion.company}`);
        setMessage(`Hello!\n\nA new job has been posted that matches your profile:\n\n🚀 ${suggestion.title}\n🏢 ${suggestion.company}\n📍 ${suggestion.location || 'Remote'}\n\nCheck out the full details and apply here:\nhttps://jobgrid.in/job/${suggestion.slug}\n\nDon't miss out on this opportunity!`);
    };

    const handleSend = async () => {
        if (!message || !subject || selectedBatches.length === 0) return;
        setLoading(true);
        try {
            const { data } = await axios.post(`${API_URL}/api/admin/alerts/batch`, {
                batches: selectedBatches,
                subject,
                message
            });
            setStatus(`Success! Sent to ${data.count} users.`);
            setMessage('');
            setSubject('');
            setSelectedJobId('');
        } catch (error) {
            console.error(error);
            setStatus('Failed to send alerts.');
        } finally {
            setLoading(false);
        }
    };

    const totalReach = selectedBatches.reduce((acc, b) => acc + (counts[b] || 0), 0);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                        <Bell className="w-6 h-6 text-black" />
                    </div>
                    Batch Alert System
                </h2>
                <p className="text-zinc-500 font-medium">AI-powered job recommendations and targeted broadcasts.</p>
            </div>

            {/* AI Suggested Section */}
            <section className="bg-zinc-950 border border-amber-500/20 rounded-[2.5rem] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] -mr-32 -mt-32" />

                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-white flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-amber-500" /> AI-Suggested Alerts
                    </h3>
                    <span className="text-xs font-black text-zinc-600 uppercase tracking-widest">
                        Based on {selectedBatches[0] || '2025'} batch patterns
                    </span>
                </div>

                <div className="space-y-4">
                    {loadingSuggestions ? (
                        Array(3).fill(0).map((_, idx) => (
                            <div key={idx} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-5 animate-pulse">
                                <div className="h-6 w-1/3 bg-zinc-800 rounded mb-2" />
                                <div className="h-4 w-1/2 bg-zinc-800/50 rounded" />
                            </div>
                        ))
                    ) : aiSuggestions.map((suggestion) => (
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
                                onClick={() => useSuggestion(suggestion)}
                                className="px-6 py-3 bg-amber-500 text-black font-black rounded-2xl text-sm hover:scale-105 transition-all shadow-lg shadow-amber-500/10 flex items-center gap-2"
                            >
                                <Zap className="w-4 h-4" /> Use Suggestion
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Broadcast Console */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                        <Send className="w-6 h-6 text-blue-500" />
                        Broadcast Console
                    </h2>
                    <div className="flex gap-6">
                        <div className="text-center px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl">
                            <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-2">Open Rate</div>
                            <div className="text-2xl font-black text-green-500 leading-none flex items-center justify-center gap-1">
                                <TrendingUp className="w-4 h-4" /> {analytics.openRate}%
                            </div>
                        </div>
                        <div className="text-center px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl">
                            <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-2">CTR</div>
                            <div className="text-2xl font-black text-blue-500 leading-none">{analytics.ctr}%</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Selection Section */}
                    <div className="space-y-8">
                        <div>
                            <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Target Batches</label>
                            <div className="grid grid-cols-3 gap-3">
                                {BATCH_OPTIONS.map(b => (
                                    <button
                                        key={b.value}
                                        onClick={() => toggleBatch(b.value)}
                                        className={`px-3 py-3 rounded-2xl text-xs font-black border transition-all ${selectedBatches.includes(b.value)
                                            ? 'bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20'
                                            : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700'
                                            }`}
                                    >
                                        {b.label}
                                        <div className="text-[10px] opacity-60 mt-1">{counts[b.value] || 0} Users</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 bg-zinc-900 rounded-3xl border border-zinc-800 flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Users className="w-16 h-16" />
                            </div>
                            <div className="relative z-10">
                                <div className="text-zinc-500 text-sm font-bold flex items-center gap-2 mb-1">
                                    <Activity className="w-4 h-4 text-amber-500" /> Estimated Reach
                                </div>
                                <p className="text-3xl font-black text-white tracking-tight">
                                    {totalReach.toLocaleString()} <span className="text-sm text-zinc-600 font-bold uppercase tracking-widest">Active Members</span>
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Or Select Specific Job</label>
                            <div className="relative">
                                <select
                                    value={selectedJobId}
                                    onChange={(e) => handleJobSelect(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white appearance-none focus:border-amber-500 transition-all font-bold"
                                >
                                    <option value="">Select a job to auto-fill...</option>
                                    {jobs.map(job => (
                                        <option key={job._id} value={job._id}>
                                            {job.company} — {job.title}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8 flex flex-col items-stretch">
                        <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Compose Broadcast</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Email Subject Line..."
                            className="w-full mb-4 bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-amber-500 transition-all font-bold"
                        />
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Message body (supports plain text or markdown)..."
                            className="w-full flex-1 min-h-[200px] bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-amber-500 transition-all font-mono mb-6"
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !message || !subject || selectedBatches.length === 0}
                            className={`w-full py-5 font-black rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl ${(loading || !message || !subject || selectedBatches.length === 0)
                                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black hover:scale-[1.02] shadow-amber-500/20 active:scale-[0.98]'
                                }`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Launch Broadcast to {totalReach.toLocaleString()} Users
                                </>
                            )}
                        </button>
                        {status && (
                            <p className={`mt-4 text-sm text-center font-bold flex items-center justify-center gap-2 ${status.includes('Success') ? 'text-green-500' : 'text-red-400'}`}>
                                {status.includes('Success') ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                {status}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
