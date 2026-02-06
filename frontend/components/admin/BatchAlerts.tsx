"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Send, Users, Briefcase, ChevronDown } from 'lucide-react';
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

export default function BatchAlerts() {
    const [selectedBatches, setSelectedBatches] = useState<string[]>(['2025']);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJobId, setSelectedJobId] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [countsRes, jobsRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/user-counts`),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs?limit=20`)
            ]);
            setCounts(countsRes.data);
            setJobs(jobsRes.data.jobs);
        } catch (error) {
            console.error('Failed to fetch alert data:', error);
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

    const handleSend = async () => {
        if (!message || !subject || selectedBatches.length === 0) return;
        setLoading(true);
        try {
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/alerts/batch`, {
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
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                Targeted Batch Alerts
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Selection Section */}
                <div>
                    <label className="block text-sm text-zinc-400 mb-2">Target Batches (Multi-select)</label>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {BATCH_OPTIONS.map(b => (
                            <button
                                key={b.value}
                                onClick={() => toggleBatch(b.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedBatches.includes(b.value)
                                    ? 'bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20'
                                    : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500'
                                    }`}
                            >
                                {b.label}
                                <span className="ml-1 opacity-60">({counts[b.value] || 0})</span>
                            </button>
                        ))}
                    </div>

                    <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 mb-6 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-zinc-400 text-sm">
                            <Users className="w-4 h-4" />
                            Total Real Reach
                        </div>
                        <p className="text-2xl font-mono font-bold text-amber-500">
                            {totalReach.toLocaleString()} <span className="text-xs text-zinc-600 font-sans">Users</span>
                        </p>
                    </div>

                    <label className="block text-sm text-zinc-400 mb-2">Auto-Generate from Job</label>
                    <div className="relative">
                        <select
                            value={selectedJobId}
                            onChange={(e) => handleJobSelect(e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-sm text-white appearance-none focus:border-amber-500 transition-colors"
                        >
                            <option value="">Select a job to auto-fill...</option>
                            {jobs.map(job => (
                                <option key={job._id} value={job._id}>
                                    {job.company} - {job.title}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>
                </div>

                {/* Content Section */}
                <div>
                    <label className="block text-sm text-zinc-400 mb-2">Email Subject</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. '🔥 New Opportunity for 2025 Batch!'"
                        className="w-full mb-4 bg-black border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                    <label className="block text-sm text-zinc-400 mb-2">Alert Message</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Choose a job above or type your own message..."
                        className="w-full h-48 bg-black border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !message || !subject || selectedBatches.length === 0}
                        className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Sending Broadcast...' : (
                            <>
                                <Send className="w-4 h-4" />
                                Broadcast to {totalReach.toLocaleString()} Users
                            </>
                        )}
                    </button>
                    {status && (
                        <p className={`mt-3 text-sm text-center font-bold ${status.includes('Success') ? 'text-green-500' : 'text-red-400'}`}>
                            {status}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
