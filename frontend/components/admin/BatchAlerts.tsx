"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell } from 'lucide-react';
import { Job } from '@/types';
import AISuggestions from './alerts/AISuggestions';
import BroadcastConsole from './alerts/BroadcastConsole';
import { AISuggestion } from './alerts/types';

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

            <AISuggestions
                suggestions={aiSuggestions}
                loading={loadingSuggestions}
                selectedBatch={selectedBatches[0] || '2025'}
                onUse={useSuggestion}
            />

            <BroadcastConsole
                selectedBatches={selectedBatches}
                toggleBatch={toggleBatch}
                counts={counts}
                analytics={analytics}
                totalReach={totalReach}
                jobs={jobs}
                selectedJobId={selectedJobId}
                onJobSelect={handleJobSelect}
                subject={subject}
                setSubject={setSubject}
                message={message}
                setMessage={setMessage}
                loading={loading}
                status={status}
                onSend={handleSend}
            />
        </div>
    );
}
