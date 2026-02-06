"use client";

import { useState, useEffect } from 'react';
import { Job, QueueItem, AdminAnalytics } from '@/types';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminTabs from '@/components/admin/AdminTabs';
import JobsTab from '@/components/admin/JobsTab';
import QueueTab from '@/components/admin/QueueTab';
import AnalyticsTab from '@/components/admin/AnalyticsTab';
import ScraperTab from '@/components/admin/ScraperTab';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jobgrid-in.onrender.com';

export default function AdminDashboard() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [analytics, setAnalytics] = useState<AdminAnalytics>({ totalJobs: 0, totalViews: 0, totalClicks: 0 });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cleaning, setCleaning] = useState(false);
    const [activeTab, setActiveTab] = useState<'jobs' | 'queue' | 'analytics' | 'scraper'>('jobs');
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

    const toggleJobStatus = async (jobId: string, currentStatus: boolean) => {
        try {
            setJobs(jobs.map(j =>
                j._id === jobId ? { ...j, isActive: !currentStatus } : j
            ));
        } catch (err) {
            console.error('Failed to toggle job status', err);
        }
    };

    const deleteJob = async (jobId: string) => {
        if (!confirm('Are you sure you want to delete this job?')) return;
        try {
            setJobs(jobs.filter(j => j._id !== jobId));
        } catch (err) {
            console.error('Failed to delete job', err);
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
                    />
                )}

                {activeTab === 'queue' && (
                    <QueueTab
                        queue={queue}
                        runQueueItem={runQueueItem}
                        deleteQueueItem={deleteQueueItem}
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
            </div>
        </main>
    );
}
