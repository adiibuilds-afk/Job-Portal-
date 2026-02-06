"use client";

import { useState, useEffect } from 'react';
import { Job, QueueItem, AdminAnalytics } from '@/types';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminTabs from '@/components/admin/AdminTabs';
import JobsTab from '@/components/admin/JobsTab';
import QueueTab from '@/components/admin/QueueTab';
import AnalyticsTab from '@/components/admin/AnalyticsTab';
import ScraperTab from '@/components/admin/ScraperTab';
import BatchAlerts from '@/components/admin/BatchAlerts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jobgrid-in.onrender.com';

export default function AdminDashboard() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [analytics, setAnalytics] = useState<AdminAnalytics>({ totalJobs: 0, totalViews: 0, totalClicks: 0 });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cleaning, setCleaning] = useState(false);
    const [activeTab, setActiveTab] = useState<'jobs' | 'queue' | 'analytics' | 'scraper' | 'alerts'>('jobs');
    const [jobFilter, setJobFilter] = useState<'all' | 'reported'>('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [jobsRes, analyticsRes, queueRes, chartRes] = await Promise.all([
                fetch(`${API_URL}/api/jobs?limit=100`),
                fetch(`${API_URL}/api/analytics`),
                fetch(`${API_URL}/api/admin/queue`),
                fetch(`${API_URL}/api/admin/analytics/detailed`)
            ]);

            const jobsData = await jobsRes.json();
            const analyticsData = await analyticsRes.json();
            const queueData = await queueRes.json();
            const chartData = await chartRes.json();

            setJobs(jobsData.jobs || []);
            setAnalytics(analyticsData);
            setQueue(queueData || []);
            setChartData(chartData || []);
        } catch (err) {
            console.error('Failed to fetch admin data', err);
        } finally {
            setLoading(false);
        }
    };

    const runCleanup = async () => {
        if (!confirm('Archive non-featured jobs older than 30 days?')) return;
        setCleaning(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/cleanup`, { method: 'POST' });
            const data = await res.json();
            alert(data.message);
            fetchData();
        } catch (err) {
            console.error('Cleanup failed', err);
        } finally {
            setCleaning(false);
        }
    };

    const runQueueItem = async (id: string) => {
        try {
            await fetch(`${API_URL}/api/admin/queue/${id}/run`, { method: 'POST' });
            fetchData();
        } catch (err) {
            console.error('Failed to run queue item', err);
        }
    };

    const deleteQueueItem = async (id: string) => {
        if (!confirm('Cancel this scheduled job?')) return;
        try {
            await fetch(`${API_URL}/api/admin/queue/${id}`, { method: 'DELETE' });
            setQueue(queue.filter(q => q._id !== id));
        } catch (err) {
            console.error('Failed to delete queue item', err);
        }
    };

    const clearQueue = async (status: string = 'pending') => {
        const confirmMsg = status === 'pending'
            ? 'Clear all pending jobs from the queue?'
            : 'Clear all processed job history?';

        if (!confirm(`${confirmMsg} This cannot be undone.`)) return;

        try {
            const res = await fetch(`${API_URL}/api/admin/queue/clear?status=${status}`, { method: 'DELETE' });
            const data = await res.json();
            alert(data.message);
            fetchData();
        } catch (err) {
            console.error('Failed to clear queue', err);
            alert('Failed to clear queue');
        }
    };

    const clearAllJobs = async () => {
        if (!confirm('EXTREME CAUTION: This will delete ALL job listings from the database. Are you absolutely sure?')) return;
        try {
            const res = await fetch(`${API_URL}/api/admin/jobs/clear`, { method: 'DELETE' });
            const data = await res.json();
            alert(data.message);
            fetchData();
        } catch (err) {
            console.error('Failed to clear jobs', err);
            alert('Failed to clear jobs');
        }
    };

    const clearReportedJobs = async () => {
        if (!confirm('Clear all reported jobs from the database?')) return;
        try {
            const res = await fetch(`${API_URL}/api/admin/jobs/reported`, { method: 'DELETE' });
            const data = await res.json();
            alert(data.message);
            fetchData();
        } catch (err) {
            console.error('Failed to clear reported jobs', err);
            alert('Failed to clear reported jobs');
        }
    };

    const toggleJobStatus = async (jobId: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`${API_URL}/api/admin/jobs/${jobId}/toggle`, { method: 'PUT' });
            if (!res.ok) throw new Error('Failed to toggle');

            setJobs(jobs.map(j =>
                j._id === jobId ? { ...j, isActive: !currentStatus } : j
            ));
        } catch (err) {
            console.error('Failed to toggle job status', err);
            alert('Failed to update status');
        }
    };

    const deleteJob = async (jobId: string) => {
        if (!confirm('Are you sure you want to delete this job?')) return;
        try {
            const res = await fetch(`${API_URL}/api/admin/jobs/${jobId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');

            setJobs(jobs.filter(j => j._id !== jobId));
        } catch (err) {
            console.error('Failed to delete job', err);
            alert('Failed to delete job');
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-black p-8">
                <div className="max-w-7xl mx-auto text-center py-20">
                    <div className="animate-spin w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-zinc-500">Loading Dashboard Command Center...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black">
            <div className="max-w-7xl mx-auto p-8">
                <AdminHeader />

                <AdminTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    pendingCount={queue.filter(q => q.status === 'pending').length}
                />

                {activeTab === 'jobs' && (
                    <JobsTab
                        jobs={jobs}
                        analytics={analytics}
                        jobFilter={jobFilter}
                        setJobFilter={setJobFilter}
                        toggleJobStatus={toggleJobStatus}
                        deleteJob={deleteJob}
                        clearAllJobs={clearAllJobs}
                        clearReportedJobs={clearReportedJobs}
                    />
                )}

                {activeTab === 'queue' && (
                    <QueueTab
                        queue={queue}
                        runQueueItem={runQueueItem}
                        deleteQueueItem={deleteQueueItem}
                        clearQueue={clearQueue}
                    />
                )}

                {activeTab === 'analytics' && (
                    <AnalyticsTab
                        chartData={chartData}
                        runCleanup={runCleanup}
                        cleaning={cleaning}
                    />
                )}

                {activeTab === 'scraper' && (
                    <ScraperTab apiUrl={API_URL} />
                )}

                {activeTab === 'alerts' && (
                    <BatchAlerts />
                )}
            </div>
        </main>
    );
}
